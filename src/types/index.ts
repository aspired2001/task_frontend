// src/types/index.ts
export interface Organization {
    id: string;
    name: string;
    slug: string;
    contactEmail: string;
    isActive: boolean;
    projectsCount: number;
    activeProjectsCount: number;
    createdAt: string;
}

export interface Project {
    id: string;
    organization: Organization;
    name: string;
    description: string;
    status: ProjectStatus;
    dueDate?: string;
    taskCount: number;
    completedTaskCount: number;
    completionRate: number;
    overdueTasksCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface Task {
    id: string;
    project: Project;
    title: string;
    description: string;
    status: TaskStatus;
    priority: TaskPriority;
    assigneeEmail: string;
    dueDate?: string;
    isOverdue: boolean;
    commentsCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface TaskComment {
    id: string;
    task: Task;
    content: string;
    authorEmail: string;
    createdAt: string;
    updatedAt: string;
}

export interface ProjectStats {
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    totalTasks: number;
    completedTasks: number;
    overdueTasks: number;
    overallCompletionRate: number;
}

export type ProjectStatus = 'ACTIVE' | 'COMPLETED' | 'ON_HOLD' | 'CANCELLED';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE' | 'BLOCKED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

// Form types
export interface CreateProjectInput {
    organizationSlug: string;
    name: string;
    description?: string;
    status?: ProjectStatus;
    dueDate?: string;
}

export interface UpdateProjectInput {
    id: string;
    organizationSlug: string;
    name?: string;
    description?: string;
    status?: ProjectStatus;
    dueDate?: string;
}

export interface CreateTaskInput {
    projectId: string;
    organizationSlug: string;
    title: string;
    description?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    assigneeEmail?: string;
    dueDate?: string;
}

export interface UpdateTaskInput {
    id: string;
    organizationSlug: string;
    title?: string;
    description?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    assigneeEmail?: string;
    dueDate?: string;
}

export interface AddTaskCommentInput {
    taskId: string;
    organizationSlug: string;
    content: string;
    authorEmail: string;
}

// API Response types
export interface MutationResponse {
    success: boolean;
    errors: string[];
}

export interface CreateProjectResponse {
    createProject?: MutationResponse & {
        project?: Project;
    };
}

export interface UpdateProjectResponse {
    updateProject?: MutationResponse & {
        project?: Project;
    };
}

export interface CreateTaskResponse {
    createTask?: MutationResponse & {
        task?: Task;
    };
}

export interface UpdateTaskResponse {
    updateTask?: MutationResponse & {
        task?: Task;
    };
}

export interface AddTaskCommentResponse {
    addTaskComment?: MutationResponse & {
        comment?: TaskComment;
    };
}