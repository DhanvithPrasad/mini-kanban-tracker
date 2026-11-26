import './style.css';

type Priority = 'Low' | 'Medium' | 'High';
type Status = 'Todo' | 'InProgress' | 'Done';

interface Task {
  id: number;
  title: string;
  description: string;
  priority: Priority;
  status: Status;
  assignee: string;
}

interface Stats {
  total: number;
  todo: number;
  inProgress: number;
  done: number;
  completionPercentage: number;
}

const API_URL = 'http://localhost:5000/api/tasks';

const priorityBadge: Record<Priority, string> = {
  High: 'bg-red-100 text-red-700',
  Medium: 'bg-amber-100 text-amber-700',
  Low: 'bg-emerald-100 text-emerald-700',
};

async function fetchAndRender(): Promise<void> {
  const priority = (document.getElementById('filterPriority') as HTMLSelectElement).value;
  const assignee = (document.getElementById('filterAssignee') as HTMLInputElement).value.trim();

  const params = new URLSearchParams();
  if (priority) params.append('priority', priority);
  if (assignee) params.append('assignee', assignee);

  const [tasksRes, statsRes] = await Promise.all([
    fetch(`${API_URL}?${params.toString()}`),
    fetch(`${API_URL}/stats`),
  ]);

  const tasks: Task[] = await tasksRes.json();
  const stats: Stats = await statsRes.json();

  renderStats(stats);
  renderBoard(tasks);
}

function renderStats(stats: Stats): void {
  const statsBar = document.getElementById('statsBar')!;
  statsBar.innerHTML = `
    <span class="bg-white px-3 py-1.5 rounded-lg border border-slate-200">Total: <strong>${stats.total}</strong></span>
    <span class="bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-emerald-700">Completed: <strong>${stats.completionPercentage}%</strong></span>
  `;
}

function renderBoard(tasks: Task[]): void {
  const cols: Record<Status, HTMLElement> = {
    Todo: document.getElementById('colTodo')!,
    InProgress: document.getElementById('colInProgress')!,
    Done: document.getElementById('colDone')!,
  };

  Object.values(cols).forEach((col) => (col.innerHTML = ''));

  const counts: Record<Status, number> = { Todo: 0, InProgress: 0, Done: 0 };

  tasks.forEach((task) => {
    counts[task.status]++;

    const card = document.createElement('div');
    card.className = 'bg-white p-4 rounded-lg shadow-sm border border-slate-200 space-y-2';

    const nextStatus: Record<Status, Status | null> = {
      Todo: 'InProgress',
      InProgress: 'Done',
      Done: null,
    };

    const prevStatus: Record<Status, Status | null> = {
      Todo: null,
      InProgress: 'Todo',
      Done: 'InProgress',
    };

    const next = nextStatus[task.status];
    const prev = prevStatus[task.status];

    card.innerHTML = `
      <div class="flex items-start justify-between gap-2">
        <h3 class="font-semibold text-slate-900 text-sm">${task.title}</h3>
        <span class="text-xs font-medium px-2 py-0.5 rounded-full ${priorityBadge[task.priority]}">${task.priority}</span>
      </div>
      ${task.description ? `<p class="text-xs text-slate-600">${task.description}</p>` : ''}
      <div class="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
        <span class="text-slate-500">Assigned: <strong class="text-slate-700">${task.assignee}</strong></span>
        <div class="flex items-center gap-1.5">
          ${prev ? `<button data-move="${prev}" class="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 cursor-pointer">&larr;</button>` : ''}
          ${next ? `<button data-move="${next}" class="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium rounded cursor-pointer">Move &rarr;</button>` : ''}
          <button data-delete="true" class="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded cursor-pointer">✕</button>
        </div>
      </div>
    `;

    card.querySelectorAll<HTMLButtonElement>('[data-move]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const status = btn.dataset.move as Status;
        await fetch(`${API_URL}/${task.id}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status }),
        });
        fetchAndRender();
      });
    });

    card.querySelector('[data-delete]')?.addEventListener('click', async () => {
      await fetch(`${API_URL}/${task.id}`, { method: 'DELETE' });
      fetchAndRender();
    });

    cols[task.status].appendChild(card);
  });

  document.getElementById('countTodo')!.textContent = String(counts.Todo);
  document.getElementById('countInProgress')!.textContent = String(counts.InProgress);
  document.getElementById('countDone')!.textContent = String(counts.Done);
}

// Form Submit Handler
document.getElementById('taskForm')!.addEventListener('submit', async (e) => {
  e.preventDefault();
  const titleEl = document.getElementById('titleInput') as HTMLInputElement;
  const descEl = document.getElementById('descInput') as HTMLInputElement;
  const priorityEl = document.getElementById('priorityInput') as HTMLSelectElement;
  const assigneeEl = document.getElementById('assigneeInput') as HTMLInputElement;

  await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: titleEl.value.trim(),
      description: descEl.value.trim(),
      priority: priorityEl.value,
      assignee: assigneeEl.value.trim(),
    }),
  });

  titleEl.value = '';
  descEl.value = '';
  assigneeEl.value = '';
  fetchAndRender();
});

// Filter Listeners


document.getElementById('filterPriority')!.addEventListener('change', fetchAndRender);
document.getElementById('filterAssignee')!.addEventListener('input', fetchAndRender);
document.getElementById('clearFilters')!.addEventListener('click', () => {
(document.getElementById('filterPriority') as HTMLSelectElement).value = '';
(document.getElementById('filterAssignee') as HTMLInputElement).value = '';
fetchAndRender();
});
// Initial Load
fetchAndRender();
