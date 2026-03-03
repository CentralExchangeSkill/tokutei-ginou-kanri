async function fetchJson(url, options) {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function loadWorkers() {
  const workers = await fetchJson('/api/workers');
  const select = document.getElementById('worker-select');
  select.innerHTML = workers
    .map((w) => `<option value="${w.id}">${w.name} (${w.email || 'no email'})</option>`)
    .join('');
}

function renderCases(cases) {
  const wrapper = document.getElementById('cases-list');
  if (cases.length === 0) {
    wrapper.innerHTML = '<div class="card">No cases yet.</div>';
    return;
  }

  wrapper.innerHTML = cases
    .map(
      (c) => `<div class="card">
      <h3><a href="/cases/${c.id}">Case #${c.id}</a> - ${c.case_type}</h3>
      <p>Worker: <a href="/workers/${c.worker_id}">${c.worker_name}</a></p>
      <p>Status: ${c.status} | Due: ${c.due_date || 'N/A'} | Assigned: ${c.assigned_user || 'Unassigned'}</p>
      <p class="small">Checklist items: ${c.checklist_count}</p>
    </div>`
    )
    .join('');
}

async function loadCases() {
  const cases = await fetchJson('/api/cases');
  renderCases(cases);
}

document.getElementById('create-case-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const fd = new FormData(event.target);
  const payload = Object.fromEntries(fd.entries());
  if (!payload.due_date) payload.due_date = null;
  if (!payload.assigned_user) payload.assigned_user = null;
  payload.worker_id = Number(payload.worker_id);

  await fetchJson('/api/cases', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  event.target.reset();
  await loadWorkers();
  await loadCases();
});

loadWorkers().then(loadCases);
