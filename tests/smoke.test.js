const assert = require('assert');
const fs = require('fs');
const path = require('path');

const dataFile = path.join(__dirname, '..', 'data.json');
if (fs.existsSync(dataFile)) fs.rmSync(dataFile);

const { createServer } = require('../server');

async function run() {
  const server = createServer();
  await new Promise((resolve) => server.listen(3100, resolve));

  try {
    const workersRes = await fetch('http://127.0.0.1:3100/api/workers');
    assert.strictEqual(workersRes.status, 200);
    const workers = await workersRes.json();
    assert.ok(workers.length >= 1);

    const createRes = await fetch('http://127.0.0.1:3100/api/cases', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        worker_id: workers[0].id,
        case_type: 'renewal',
        status: 'open',
        due_date: '2026-01-01',
        assigned_user: 'ops@example.com'
      })
    });

    assert.strictEqual(createRes.status, 201);
    const created = await createRes.json();

    const detailRes = await fetch(`http://127.0.0.1:3100/api/cases/${created.id}`);
    assert.strictEqual(detailRes.status, 200);
    const detail = await detailRes.json();
    assert.strictEqual(detail.case_type, 'renewal');
    assert.ok(detail.checklist_items.length >= 3);

    console.log('Smoke test passed');
  } finally {
    server.close();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
