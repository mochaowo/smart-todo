export enum TaskStatus {
    TODO = "TODO",
    IN_PROGRESS = "IN_PROGRESS",
    DONE = "DONE"
}

export interface Task {
    id: number;
    title: string;
    description?: string;
    priority: number;
    status: TaskStatus;
    due_date?: string;
    created_at: string;
    updated_at: string;
    position: number;
    tags?: string;
}

export interface TaskCreate {
    title: string;
    description?: string;
    priority?: number;
    status?: TaskStatus;
    due_date?: string;
    position?: number;
    tags?: string;
}

export interface TaskUpdate {
    title?: string;
    description?: string;
    priority?: number;
    status?: TaskStatus;
    due_date?: string;
    position?: number;
    tags?: string;
}
