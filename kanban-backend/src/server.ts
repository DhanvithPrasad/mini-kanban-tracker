import express from 'express';
import cors from 'cors';
import taskRoutes from './routes/taskRoutes';

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.use('/api/tasks', taskRoutes);

app.listen(PORT, () => {
  console.log(`Kanban API server running at http://localhost:${PORT}`);
});
