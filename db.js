const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'data.json');

const CASE_CHECKLIST_TEMPLATES = {
  'new-visa': ['Passport Copy', 'Residence Card', 'Employment Contract'],
  renewal: ['Current Visa Copy', 'Tax Certificate', 'Company Support Letter'],
  change: ['Statement of Reason', 'Updated Contract', 'Qualification Evidence']
};

function loadData() {
  if (!fs.existsSync(dataPath)) {
    const initial = {
      counters: { worker: 2, case: 0, checklistItem: 0, document: 0 },
      workers: [
        { id: 1, name: 'Sakura Tanaka', email: 'sakura@example.com' },
        { id: 2, name: 'Kenji Sato', email: 'kenji@example.com' }
      ],
      visaCases: [],
      checklistItems: [],
      checklistDocuments: []
    };
    fs.writeFileSync(dataPath, JSON.stringify(initial, null, 2));
  }

  return JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
}

function saveData(data) {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

function getWorkers() {
  return loadData().workers;
}


function getWorkerWithCases(id) {
  const data = loadData();
  const worker = data.workers.find((w) => w.id === Number(id));
  if (!worker) return null;

  const cases = data.visaCases.filter((c) => c.worker_id === worker.id);
  return { ...worker, cases };
}

function createCase(payload) {
  const data = loadData();
  const worker = data.workers.find((w) => w.id === Number(payload.worker_id));
  if (!worker) return null;

  const caseId = ++data.counters.case;
  const visaCase = {
    id: caseId,
    worker_id: Number(payload.worker_id),
    case_type: payload.case_type,
    status: payload.status || 'open',
    due_date: payload.due_date || null,
    assigned_user: payload.assigned_user || null,
    created_at: new Date().toISOString()
  };

  data.visaCases.push(visaCase);

  const template = CASE_CHECKLIST_TEMPLATES[visaCase.case_type] || ['General Application Form', 'ID Proof'];
  template.forEach((title, idx) => {
    const itemId = ++data.counters.checklistItem;
    data.checklistItems.push({
      id: itemId,
      visa_case_id: caseId,
      title,
      status: 'pending',
      sort_order: idx + 1
    });
  });

  saveData(data);
  return visaCase;
}

function getCases() {
  const data = loadData();
  return data.visaCases.map((c) => ({
    ...c,
    worker_name: data.workers.find((w) => w.id === c.worker_id)?.name || 'Unknown',
    checklist_count: data.checklistItems.filter((i) => i.visa_case_id === c.id).length
  }));
}

function getCaseDetail(id) {
  const data = loadData();
  const visaCase = data.visaCases.find((c) => c.id === Number(id));
  if (!visaCase) return null;

  const checklist_items = data.checklistItems
    .filter((i) => i.visa_case_id === visaCase.id)
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((item) => ({
      ...item,
      documents: data.checklistDocuments.filter((d) => d.checklist_item_id === item.id)
    }));

  const worker = data.workers.find((w) => w.id === visaCase.worker_id);

  return {
    ...visaCase,
    worker_name: worker?.name || 'Unknown',
    checklist_items
  };
}

function updateChecklistItem(id, status) {
  const data = loadData();
  const item = data.checklistItems.find((i) => i.id === Number(id));
  if (!item) return null;
  item.status = status;
  saveData(data);
  return item;
}

function addChecklistDocument(checklistItemId, originalName, storedPath) {
  const data = loadData();
  const item = data.checklistItems.find((i) => i.id === Number(checklistItemId));
  if (!item) return null;

  const doc = {
    id: ++data.counters.document,
    checklist_item_id: item.id,
    original_name: originalName,
    stored_path: storedPath,
    uploaded_at: new Date().toISOString()
  };
  data.checklistDocuments.push(doc);
  saveData(data);
  return doc;
}

module.exports = {
  getWorkers,
  getWorkerWithCases,
  createCase,
  getCases,
  getCaseDetail,
  updateChecklistItem,
  addChecklistDocument
};
