export type ProjectStatus = 'In Progress' | 'Completed';

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  projectId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  status: ProjectStatus;
  tasks: Task[];
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskData {
  title: string;
  projectId: string;
}

export interface UpdateTaskData {
  title?: string;
  completed?: boolean;
}

export interface CreateProjectData {
  name: string;
  userId: string;
}

export interface UpdateProjectData {
  name?: string;
  status?: ProjectStatus;
}

export interface ProjectState {
  projects: Project[];
  isLoading: boolean;
  error: string | null;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
} 