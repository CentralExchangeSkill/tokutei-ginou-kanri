const now = new Date('2026-01-10');
const MS_PER_DAY = 1000 * 60 * 60 * 24;

const dayDiff = (dateString) => Math.ceil((new Date(dateString) - now) / MS_PER_DAY);

const expiringIn = (days) => workers.filter((w) => {
  const d = dayDiff(w.visaExpiry);
  return d >= 0 && d <= days;
}).length;

const overdueCases = cases.filter((c) => dayDiff(c.dueDate) < 0).length;

const missingChecklist = cases.filter((c) => c.checklist.some((item) => !item.completed)).length;

const cards = [
  {
    label: 'Visa expiring in 30 days',
    value: expiringIn(30),
    tag: 'warning',
    hint: 'Workers needing immediate action',
    href: 'workers.html?filter=expiring_30'
  },
  {
    label: 'Visa expiring in 60 days',
    value: expiringIn(60),
    tag: 'accent',
    hint: 'Plan upcoming renewals',
    href: 'workers.html?filter=expiring_60'
  },
  {
    label: 'Visa expiring in 90 days',
    value: expiringIn(90),
    tag: 'accent',
    hint: 'Prepare documentation early',
    href: 'workers.html?filter=expiring_90'
  },
  {
    label: 'Overdue visa cases',
    value: overdueCases,
    tag: 'danger',
    hint: 'Past due date and still open',
    href: 'cases.html?filter=overdue'
  },
  {
    label: 'Missing checklist items',
    value: missingChecklist,
    tag: 'warning',
    hint: 'Cases with incomplete documents',
    href: 'cases.html?filter=missing_checklist'
  }
];

const cardsContainer = document.querySelector('#cards');
cardsContainer.innerHTML = cards.map((card) => `
  <a class="card" href="${card.href}">
    <div class="tag ${card.tag}">${card.label}</div>
    <div class="value">${card.value}</div>
    <div class="hint">${card.hint}</div>
  </a>
`).join('');
