const params = new URLSearchParams(window.location.search);
const filter = params.get('filter') || 'expiring_30';
const now = new Date('2026-01-10');
const MS_PER_DAY = 1000 * 60 * 60 * 24;
const dayDiff = (dateString) => Math.ceil((new Date(dateString) - now) / MS_PER_DAY);

const dayLimit = {
  expiring_30: 30,
  expiring_60: 60,
  expiring_90: 90
}[filter] || 30;

const label = {
  expiring_30: 'Workers with visa expiring in 30 days',
  expiring_60: 'Workers with visa expiring in 60 days',
  expiring_90: 'Workers with visa expiring in 90 days'
}[filter] || 'Workers';

document.querySelector('#title').textContent = label;

const filteredWorkers = workers.filter((w) => {
  const days = dayDiff(w.visaExpiry);
  return days >= 0 && days <= dayLimit;
});

document.querySelector('#rows').innerHTML = filteredWorkers.map((w) => `
  <tr>
    <td>${w.name}</td>
    <td>${w.company}</td>
    <td>${w.visaExpiry}</td>
    <td>${dayDiff(w.visaExpiry)}</td>
  </tr>
`).join('');
