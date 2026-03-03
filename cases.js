const params = new URLSearchParams(window.location.search);
const filter = params.get('filter') || 'overdue';
const now = new Date('2026-01-10');
const MS_PER_DAY = 1000 * 60 * 60 * 24;
const dayDiff = (dateString) => Math.ceil((new Date(dateString) - now) / MS_PER_DAY);

const workerName = (id) => workers.find((w) => w.id === id)?.name || '-';

let title = 'Cases';
let filtered = [];

if (filter === 'overdue') {
  title = 'Overdue visa cases';
  filtered = cases.filter((c) => dayDiff(c.dueDate) < 0);
} else if (filter === 'missing_checklist') {
  title = 'Cases with missing checklist items';
  filtered = cases.filter((c) => c.checklist.some((item) => !item.completed));
}

document.querySelector('#title').textContent = title;

document.querySelector('#rows').innerHTML = filtered.map((c) => {
  const status = filter === 'overdue'
    ? `${Math.abs(dayDiff(c.dueDate))} days overdue`
    : `${c.checklist.filter((i) => !i.completed).length} checklist item(s) missing`;

  return `
    <tr>
      <td>${c.id}</td>
      <td>${workerName(c.workerId)}</td>
      <td>${c.dueDate}</td>
      <td>${status}</td>
    </tr>
  `;
}).join('');
