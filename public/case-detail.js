async function fetchJson(url, options) {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

function getCaseId() {
  const parts = window.location.pathname.split('/');
  return parts[parts.length - 1];
}

function statusBadge(status) {
  const cls = status === 'done' ? 'done' : status === 'in-progress' ? 'in-progress' : 'pending';
  return `<span class="status ${cls}">${status}</span>`;
}

async function updateItemStatus(itemId, status) {
  await fetchJson(`/api/checklist-items/${itemId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  await load();
}

async function uploadDocument(itemId, fileInput) {
  const file = fileInput.files[0];
  if (!file) return;

  const fd = new FormData();
  fd.append('document', file);
  await fetchJson(`/api/checklist-items/${itemId}/documents`, {
    method: 'POST',
    body: fd
  });
  await load();
}

function renderChecklist(items) {
  const wrapper = document.getElementById('checklist');
  wrapper.innerHTML = items
    .map(
      (item) => `<div class="card">
      <div class="row">
        <h3>${item.title}</h3>
        ${statusBadge(item.status)}
        <select data-status-item-id="${item.id}">
          <option value="pending" ${item.status === 'pending' ? 'selected' : ''}>pending</option>
          <option value="in-progress" ${item.status === 'in-progress' ? 'selected' : ''}>in-progress</option>
          <option value="done" ${item.status === 'done' ? 'selected' : ''}>done</option>
        </select>
      </div>
      <div class="row">
        <input type="file" data-upload-item-id="${item.id}" />
        <button data-upload-btn-id="${item.id}">Upload document</button>
      </div>
      <ul>
        ${item.documents
          .map(
            (doc) => `<li><a href="/${doc.stored_path}" target="_blank">${doc.original_name}</a> <span class="small">(${doc.uploaded_at})</span></li>`
          )
          .join('') || '<li class="small">No documents uploaded</li>'}
      </ul>
    </div>`
    )
    .join('');

  wrapper.querySelectorAll('select[data-status-item-id]').forEach((el) => {
    el.addEventListener('change', async (e) => {
      await updateItemStatus(el.dataset.statusItemId, e.target.value);
    });
  });

  wrapper.querySelectorAll('button[data-upload-btn-id]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const itemId = btn.dataset.uploadBtnId;
      const input = wrapper.querySelector(`input[data-upload-item-id="${itemId}"]`);
      await uploadDocument(itemId, input);
    });
  });
}

async function load() {
  const caseId = getCaseId();
  const data = await fetchJson(`/api/cases/${caseId}`);

  document.getElementById('case-header').innerHTML = `
    <h1>Case #${data.id}</h1>
    <p>Worker: <a href="/workers/${data.worker_id}">${data.worker_name}</a></p>
    <p>Type: ${data.case_type} | Status: ${data.status} | Due: ${data.due_date || 'N/A'} | Assigned: ${data.assigned_user || 'Unassigned'}</p>
  `;

  renderChecklist(data.checklist_items);
}

load();
