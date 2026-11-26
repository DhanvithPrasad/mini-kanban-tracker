export type Priority = 'Low' | 'Medium' | 'High';
export type Status = 'Todo' | 'InProgress' | 'Done';

export interface Task {
  id: number;
  title: string;
  description: string;
  priority: Priority;
  status: Status;
  assignee: string;
  createdAt: string;
}

export interface CreateTaskDTO {
  title: string;
  description?: string;
  priority: Priority;
  assignee: string;
}
