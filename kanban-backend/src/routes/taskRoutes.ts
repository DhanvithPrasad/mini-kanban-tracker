import { Router, Request, Response } from 'express';
import * as taskService from '../services/taskService';
import { Priority, Status } from '../types/task';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  const priority = req.query.priority as string | undefined;
  const assignee = req.query.assignee as string | undefined;
  res.json(taskService.getAllTasks(priority, assignee));
});

router.get('/stats', (_req: Request, res: Response) => {
  res.json(taskService.getTaskStats());
});

router.post('/', (req: Request, res: Response) => {
  const { title, description, priority, assignee } = req.body;

  if (!title || !priority || !assignee) {
    res.status(400).json({ message: 'title, priority, and assignee are required.' });
    return;
  }

  const validPriorities: Priority[] = ['Low', 'Medium', 'High'];
  if (!validPriorities.includes(priority)) {
    res.status(400).json({ message: 'priority must be Low, Medium, or High.' });
    return;
  }

  const created = taskService.createTask({ title, description, priority, assignee });
  res.status(201).json(created);
});

router.patch('/:id/status', (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { status } = req.body as { status: Status };

  const validStatuses: Status[] = ['Todo', 'InProgress', 'Done'];
  if (!validStatuses.includes(status)) {
    res.status(400).json({ message: 'status must be Todo, InProgress, or Done.' });
    return;
  }

  const updated = taskService.updateTaskStatus(id, status);
  if (!updated) {
    res.status(404).json({ message: 'Task not found.' });
    return;
  }

  res.json(updated);
});

router.delete('/:id', (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const deleted = taskService.deleteTask(id);

  if (!deleted) {
    res.status(404).json({ message: 'Task not found.' });
    return;
  }

  res.json({ message: 'Task deleted.' });
});

export default router;
