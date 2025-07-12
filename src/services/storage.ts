import AsyncStorage from '@react-native-async-storage/async-storage';
import { Project, Task, CreateProjectData, CreateTaskData, UpdateProjectData, UpdateTaskData, User } from '../types';

const PROJECTS_KEY = 'projects';
const USERS_KEY = 'users';
const CURRENT_USER_KEY = 'currentUser';

export class StorageService {
  // User operations
  static async getUsers(): Promise<User[]> {
    try {
      const usersJson = await AsyncStorage.getItem(USERS_KEY);
      return usersJson ? JSON.parse(usersJson) : [];
    } catch (error) {
      console.error('Error getting users:', error);
      return [];
    }
  }

  static async saveUsers(users: User[]): Promise<void> {
    try {
      await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
    } catch (error) {
      console.error('Error saving users:', error);
      throw error;
    }
  }

  static async createUser(email: string, password: string, name: string): Promise<User> {
    try {
      const users = await this.getUsers();
      
      // Check if user already exists
      const existingUser = users.find(u => u.email === email);
      if (existingUser) {
        throw new Error('User already exists');
      }

      const newUser: User = {
        id: Date.now().toString(),
        email,
        name,
      };
      
      users.push(newUser);
      await this.saveUsers(users);
      return newUser;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  static async loginUser(email: string, password: string): Promise<User> {
    try {
      const users = await this.getUsers();
      const user = users.find(u => u.email === email);
      
      if (!user) {
        throw new Error('User not found');
      }

      // In a real app, you'd verify the password hash
      // For now, we'll just check if the user exists
      return user;
    } catch (error) {
      console.error('Error logging in user:', error);
      throw error;
    }
  }

  static async getCurrentUser(): Promise<User | null> {
    try {
      const userJson = await AsyncStorage.getItem(CURRENT_USER_KEY);
      return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  static async setCurrentUser(user: User | null): Promise<void> {
    try {
      if (user) {
        await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      } else {
        await AsyncStorage.removeItem(CURRENT_USER_KEY);
      }
    } catch (error) {
      console.error('Error setting current user:', error);
      throw error;
    }
  }

  // Project operations
  static async getProjects(userId: string): Promise<Project[]> {
    try {
      const projectsJson = await AsyncStorage.getItem(PROJECTS_KEY);
      const allProjects = projectsJson ? JSON.parse(projectsJson) : [];
      return allProjects.filter((project: Project) => project.userId === userId);
    } catch (error) {
      console.error('Error getting projects:', error);
      return [];
    }
  }

  static async saveProjects(projects: Project[]): Promise<void> {
    try {
      await AsyncStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
    } catch (error) {
      console.error('Error saving projects:', error);
      throw error;
    }
  }

  static async createProject(projectData: CreateProjectData): Promise<Project> {
    try {
      const allProjects = await this.getAllProjects();
      const newProject: Project = {
        id: Date.now().toString(),
        name: projectData.name,
        status: 'In Progress',
        tasks: [],
        userId: projectData.userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      allProjects.push(newProject);
      await this.saveProjects(allProjects);
      return newProject;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  }

  static async getAllProjects(): Promise<Project[]> {
    try {
      const projectsJson = await AsyncStorage.getItem(PROJECTS_KEY);
      return projectsJson ? JSON.parse(projectsJson) : [];
    } catch (error) {
      console.error('Error getting all projects:', error);
      return [];
    }
  }

  static async updateProject(projectId: string, updateData: UpdateProjectData): Promise<Project> {
    try {
      const allProjects = await this.getAllProjects();
      const projectIndex = allProjects.findIndex(p => p.id === projectId);
      
      if (projectIndex === -1) {
        throw new Error('Project not found');
      }

      const updatedProject = {
        ...allProjects[projectIndex],
        ...updateData,
        updatedAt: new Date().toISOString(),
      };

      // Auto-update status based on task completion
      const completedTasks = updatedProject.tasks.filter(task => task.completed).length;
      const totalTasks = updatedProject.tasks.length;
      
      if (totalTasks > 0 && completedTasks === totalTasks) {
        updatedProject.status = 'Completed';
      } else {
        updatedProject.status = 'In Progress';
      }

      allProjects[projectIndex] = updatedProject;
      await this.saveProjects(allProjects);
      return updatedProject;
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  }

  static async saveProjectProgress(projectId: string): Promise<void> {
    try {
      const allProjects = await this.getAllProjects();
      const projectIndex = allProjects.findIndex(p => p.id === projectId);
      
      if (projectIndex === -1) {
        throw new Error('Project not found');
      }

      const project = allProjects[projectIndex];
      const completedTasks = project.tasks.filter(task => task.completed).length;
      const totalTasks = project.tasks.length;
      
      // Update status based on completion
      if (totalTasks > 0 && completedTasks === totalTasks) {
        project.status = 'Completed';
      } else {
        project.status = 'In Progress';
      }

      project.updatedAt = new Date().toISOString();
      allProjects[projectIndex] = project;
      await this.saveProjects(allProjects);
    } catch (error) {
      console.error('Error saving project progress:', error);
      throw error;
    }
  }

  static async deleteProject(projectId: string): Promise<void> {
    try {
      const allProjects = await this.getAllProjects();
      const filteredProjects = allProjects.filter(p => p.id !== projectId);
      await this.saveProjects(filteredProjects);
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  }

  // Task operations
  static async getTasks(projectId: string): Promise<Task[]> {
    try {
      const allProjects = await this.getAllProjects();
      const project = allProjects.find(p => p.id === projectId);
      return project ? project.tasks : [];
    } catch (error) {
      console.error('Error getting tasks:', error);
      return [];
    }
  }

  static async createTask(taskData: CreateTaskData): Promise<Task> {
    try {
      const allProjects = await this.getAllProjects();
      const projectIndex = allProjects.findIndex(p => p.id === taskData.projectId);
      
      if (projectIndex === -1) {
        throw new Error('Project not found');
      }

      const newTask: Task = {
        id: Date.now().toString(),
        title: taskData.title,
        completed: false,
        projectId: taskData.projectId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      allProjects[projectIndex].tasks.push(newTask);
      allProjects[projectIndex].updatedAt = new Date().toISOString();
      
      // Auto-update project status
      const completedTasks = allProjects[projectIndex].tasks.filter(task => task.completed).length;
      const totalTasks = allProjects[projectIndex].tasks.length;
      
      if (totalTasks > 0 && completedTasks === totalTasks) {
        allProjects[projectIndex].status = 'Completed';
      } else {
        allProjects[projectIndex].status = 'In Progress';
      }

      await this.saveProjects(allProjects);
      return newTask;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }

  static async updateTask(projectId: string, taskId: string, updateData: UpdateTaskData): Promise<Task> {
    try {
      const allProjects = await this.getAllProjects();
      const projectIndex = allProjects.findIndex(p => p.id === projectId);
      
      if (projectIndex === -1) {
        throw new Error('Project not found');
      }

      const taskIndex = allProjects[projectIndex].tasks.findIndex(t => t.id === taskId);
      
      if (taskIndex === -1) {
        throw new Error('Task not found');
      }

      const updatedTask = {
        ...allProjects[projectIndex].tasks[taskIndex],
        ...updateData,
        updatedAt: new Date().toISOString(),
      };

      allProjects[projectIndex].tasks[taskIndex] = updatedTask;
      allProjects[projectIndex].updatedAt = new Date().toISOString();
      
      // Auto-update project status
      const completedTasks = allProjects[projectIndex].tasks.filter(task => task.completed).length;
      const totalTasks = allProjects[projectIndex].tasks.length;
      
      if (totalTasks > 0 && completedTasks === totalTasks) {
        allProjects[projectIndex].status = 'Completed';
      } else {
        allProjects[projectIndex].status = 'In Progress';
      }

      await this.saveProjects(allProjects);
      return updatedTask;
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  }

  static async deleteTask(projectId: string, taskId: string): Promise<void> {
    try {
      const allProjects = await this.getAllProjects();
      const projectIndex = allProjects.findIndex(p => p.id === projectId);
      
      if (projectIndex === -1) {
        throw new Error('Project not found');
      }

      allProjects[projectIndex].tasks = allProjects[projectIndex].tasks.filter(t => t.id !== taskId);
      allProjects[projectIndex].updatedAt = new Date().toISOString();
      
      // Auto-update project status
      const completedTasks = allProjects[projectIndex].tasks.filter(task => task.completed).length;
      const totalTasks = allProjects[projectIndex].tasks.length;
      
      if (totalTasks === 0) {
        allProjects[projectIndex].status = 'In Progress';
      } else if (totalTasks > 0 && completedTasks === totalTasks) {
        allProjects[projectIndex].status = 'Completed';
      } else {
        allProjects[projectIndex].status = 'In Progress';
      }

      await this.saveProjects(allProjects);
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }
} 