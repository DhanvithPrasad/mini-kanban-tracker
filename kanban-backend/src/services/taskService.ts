import fs from 'fs';
import path from 'path';
import { Task, CreateTaskDTO, Status } from '../types/task';

const dataDir = path.join(process.cwd(), 'data');
const filePath = path.join(dataDir, 'tasks.json');

function ensureStorage(): void {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(filePath)) {
    const initialTasks: Task[] = [
      {
        id: 1,
        title: 'Setup Kanban Backend',
        description: 'Initialize Express with TypeScript',
        priority: 'High',
        status: 'Done',
        assignee: 'Dhanvith',
        createdAt: new Date().toISOString(),
      },
      {
        id: 2,
        title: 'Build Tailwind Kanban UI',
        description: 'Create Todo, InProgress, and Done columns',
        priority: 'Medium',
        status: 'InProgress',
        assignee: 'Dhanvith',
        createdAt: new Date().toISOString(),
      },
    ];
    fs.writeFileSync(filePath, JSON.stringify(initialTasks, null, 2));
  }
}

export function getAllTasks(priority?: string, assignee?: string): Task[] {
  ensureStorage();
  const rawData = fs.readFileSync(filePath, 'utf-8');
  let tasks: Task[] = JSON.parse(rawData);

  if (priority) {
    tasks = tasks.filter((t) => t.priority.toLowerCase() === priority.toLowerCase());
  }
  if (assignee) {
    tasks = tasks.filter((t) => t.assignee.toLowerCase().includes(assignee.toLowerCase()));
  }

  return tasks;
}

function saveTasks(tasks: Task[]): void {
  ensureStorage();
  fs.writeFileSync(filePath, JSON.stringify(tasks, null, 2));
}

export function createTask(input: CreateTaskDTO): Task {
  const tasks = getAllTasks();
  const nextId = tasks.length > 0 ? Math.max(...tasks.map((t) => t.id)) + 1 : 1;

  const newTask: Task = {
    id: nextId,
    title: input.title,
    description: input.description || '',
    priority: input.priority,
    status: 'Todo',
    assignee: input.assignee,
    createdAt: new Date().toISOString(),
  };

  tasks.push(newTask);
  saveTasks(tasks);
  return newTask;
}

export function updateTaskStatus(id: number, status: Status): Task | null {
  const tasks = getAllTasks();
  const index = tasks.findIndex((t) => t.id === id);

  if (index === -1) return null;

  tasks[index].status = status;
  saveTasks(tasks);
  return tasks[index];
}

export function deleteTask(id: number): boolean {
  const tasks = getAllTasks();
  const filtered = tasks.filter((t) => t.id !== id);

  if (filtered.length === tasks.length) return false;

  saveTasks(filtered);
  return true;
}

export function getTaskStats() {
  const tasks = getAllTasks();
  const total = tasks.length;
  const todo = tasks.filter((t) => t.status === 'Todo').length;
  const inProgress = tasks.filter((t) => t.status === 'InProgress').length;
  const done = tasks.filter((t) => t.status === 'Done').length;
  const completionPercentage = total === 0 ? 0 : Math.round((done / total) * 100);

  return { total, todo, inProgress, done, completionPercentage };
}
