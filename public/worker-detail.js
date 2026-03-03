async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

function getWorkerId() {
  const parts = window.location.pathname.split('/');
  return parts[parts.length - 1];
}

async function loadWorker() {
  const workerId = getWorkerId();
  const worker = await fetchJson(`/api/workers/${workerId}`);

  document.getElementById('worker-card').innerHTML = `
    <h1>${worker.name}</h1>
    <p>Email: ${worker.email || 'N/A'}</p>
  `;

  const container = document.getElementById('worker-cases');
  if (worker.cases.length === 0) {
    container.innerHTML = '<p class="small">No cases for this worker.</p>';
    return;
  }

  container.innerHTML = worker.cases
    .map(
      (c) => `<div class="card">
        <h3><a href="/cases/${c.id}">Case #${c.id}</a></h3>
        <p>Type: ${c.case_type} | Status: ${c.status} | Due: ${c.due_date || 'N/A'} | Assigned: ${c.assigned_user || 'Unassigned'}</p>
      </div>`
    )
    .join('');
}

loadWorker();
