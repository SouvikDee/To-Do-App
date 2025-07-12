import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Project, ProjectState, CreateProjectData, CreateTaskData, UpdateProjectData, UpdateTaskData } from '../types';
import { StorageService } from '../services/storage';
import { useAuth } from './AuthContext';

// Action types
type ProjectAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_PROJECTS'; payload: Project[] }
  | { type: 'ADD_PROJECT'; payload: Project }
  | { type: 'UPDATE_PROJECT'; payload: Project }
  | { type: 'DELETE_PROJECT'; payload: string }
  | { type: 'ADD_TASK'; payload: { projectId: string; task: any } }
  | { type: 'UPDATE_TASK'; payload: { projectId: string; task: any } }
  | { type: 'DELETE_TASK'; payload: { projectId: string; taskId: string } };

// Initial state
const initialState: ProjectState = {
  projects: [],
  isLoading: false,
  error: null,
};

// Reducer
const projectReducer = (state: ProjectState, action: ProjectAction): ProjectState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_PROJECTS':
      return { ...state, projects: action.payload };
    case 'ADD_PROJECT':
      return { ...state, projects: [...state.projects, action.payload] };
    case 'UPDATE_PROJECT':
      return {
        ...state,
        projects: state.projects.map(p => 
          p.id === action.payload.id ? action.payload : p
        ),
      };
    case 'DELETE_PROJECT':
      return {
        ...state,
        projects: state.projects.filter(p => p.id !== action.payload),
      };
    case 'ADD_TASK':
      return {
        ...state,
        projects: state.projects.map(p => 
          p.id === action.payload.projectId 
            ? { ...p, tasks: [...p.tasks, action.payload.task] }
            : p
        ),
      };
    case 'UPDATE_TASK':
      return {
        ...state,
        projects: state.projects.map(p => 
          p.id === action.payload.projectId 
            ? { 
                ...p, 
                tasks: p.tasks.map(t => 
                  t.id === action.payload.task.id ? action.payload.task : t
                )
              }
            : p
        ),
      };
    case 'DELETE_TASK':
      return {
        ...state,
        projects: state.projects.map(p => 
          p.id === action.payload.projectId 
            ? { 
                ...p, 
                tasks: p.tasks.filter(t => t.id !== action.payload.taskId)
              }
            : p
        ),
      };
    default:
      return state;
  }
};

// Context
interface ProjectContextType extends ProjectState {
  createProject: (projectData: CreateProjectData) => Promise<void>;
  updateProject: (projectId: string, updateData: UpdateProjectData) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  createTask: (taskData: CreateTaskData) => Promise<void>;
  updateTask: (projectId: string, taskId: string, updateData: UpdateTaskData) => Promise<void>;
  deleteTask: (projectId: string, taskId: string) => Promise<void>;
  saveProjectProgress: (projectId: string) => Promise<void>;
  refreshProjects: () => Promise<void>;
  clearError: () => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

// Provider
export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(projectReducer, initialState);
  const { user } = useAuth();

  // Load projects when user changes
  useEffect(() => {
    if (user) {
      refreshProjects();
    } else {
      dispatch({ type: 'SET_PROJECTS', payload: [] });
    }
  }, [user]);

  const refreshProjects = async () => {
    if (!user) return;
    
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const projects = await StorageService.getProjects(user.id);
      dispatch({ type: 'SET_PROJECTS', payload: projects });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to load projects' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const createProject = async (projectData: CreateProjectData) => {
    if (!user) return;
    
    try {
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const newProject = await StorageService.createProject({
        ...projectData,
        userId: user.id,
      });
      dispatch({ type: 'ADD_PROJECT', payload: newProject });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to create project' });
      throw error;
    }
  };

  const updateProject = async (projectId: string, updateData: UpdateProjectData) => {
    try {
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const updatedProject = await StorageService.updateProject(projectId, updateData);
      dispatch({ type: 'UPDATE_PROJECT', payload: updatedProject });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to update project' });
      throw error;
    }
  };

  const deleteProject = async (projectId: string) => {
    try {
      dispatch({ type: 'SET_ERROR', payload: null });
      
      await StorageService.deleteProject(projectId);
      dispatch({ type: 'DELETE_PROJECT', payload: projectId });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to delete project' });
      throw error;
    }
  };

  const createTask = async (taskData: CreateTaskData) => {
    try {
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const newTask = await StorageService.createTask(taskData);
      dispatch({ type: 'ADD_TASK', payload: { projectId: taskData.projectId, task: newTask } });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to create task' });
      throw error;
    }
  };

  const updateTask = async (projectId: string, taskId: string, updateData: UpdateTaskData) => {
    try {
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const updatedTask = await StorageService.updateTask(projectId, taskId, updateData);
      dispatch({ type: 'UPDATE_TASK', payload: { projectId, task: updatedTask } });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to update task' });
      throw error;
    }
  };

  const deleteTask = async (projectId: string, taskId: string) => {
    try {
      dispatch({ type: 'SET_ERROR', payload: null });
      
      await StorageService.deleteTask(projectId, taskId);
      dispatch({ type: 'DELETE_TASK', payload: { projectId, taskId } });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to delete task' });
      throw error;
    }
  };

  const saveProjectProgress = async (projectId: string) => {
    try {
      dispatch({ type: 'SET_ERROR', payload: null });
      
      await StorageService.saveProjectProgress(projectId);
      // Refresh projects to get updated status
      await refreshProjects();
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to save progress' });
      throw error;
    }
  };

  const clearError = () => {
    dispatch({ type: 'SET_ERROR', payload: null });
  };

  const value: ProjectContextType = {
    ...state,
    createProject,
    updateProject,
    deleteProject,
    createTask,
    updateTask,
    deleteTask,
    saveProjectProgress,
    refreshProjects,
    clearError,
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
};

// Hook
export const useProjects = (): ProjectContextType => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
}; 