const http = require('http');
const fs = require('fs');
const path = require('path');
const {
  getWorkers,
  getWorkerWithCases,
  createCase,
  getCases,
  getCaseDetail,
  updateChecklistItem,
  addChecklistDocument
} = require('./db');

const publicDir = path.join(__dirname, 'public');
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

function sendJson(res, code, payload) {
  res.writeHead(code, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(payload));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function parseMultipart(buffer, boundary) {
  const marker = Buffer.from(`--${boundary}`);
  const parts = [];
  let start = buffer.indexOf(marker) + marker.length + 2;

  while (start < buffer.length) {
    const end = buffer.indexOf(marker, start);
    if (end === -1) break;
    const part = buffer.subarray(start, end - 2);
    const headerEnd = part.indexOf(Buffer.from('\r\n\r\n'));
    if (headerEnd > -1) {
      const header = part.subarray(0, headerEnd).toString('utf-8');
      const body = part.subarray(headerEnd + 4);
      parts.push({ header, body });
    }
    start = end + marker.length + 2;
  }
  return parts;
}

function serveFile(res, filePath) {
  if (!fs.existsSync(filePath)) {
    res.writeHead(404);
    return res.end('Not found');
  }

  const ext = path.extname(filePath);
  const types = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8'
  };
  res.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream' });
  fs.createReadStream(filePath).pipe(res);
}

function createServer() {
  return http.createServer(async (req, res) => {
    const url = new URL(req.url, 'http://localhost');

    if (req.method === 'GET' && url.pathname === '/api/workers') {
      return sendJson(res, 200, getWorkers());
    }

    if (req.method === 'GET' && url.pathname.startsWith('/api/workers/')) {
      const worker = getWorkerWithCases(url.pathname.split('/').pop());
      if (!worker) return sendJson(res, 404, { error: 'Worker not found' });
      return sendJson(res, 200, worker);
    }

    if (req.method === 'POST' && url.pathname === '/api/cases') {
      const raw = await readBody(req);
      const payload = JSON.parse(raw.toString() || '{}');
      if (!payload.worker_id || !payload.case_type) {
        return sendJson(res, 400, { error: 'worker_id and case_type are required' });
      }
      const created = createCase(payload);
      if (!created) return sendJson(res, 404, { error: 'Worker not found' });
      return sendJson(res, 201, created);
    }

    if (req.method === 'GET' && url.pathname === '/api/cases') {
      return sendJson(res, 200, getCases());
    }

    if (req.method === 'GET' && url.pathname.startsWith('/api/cases/')) {
      const detail = getCaseDetail(url.pathname.split('/').pop());
      if (!detail) return sendJson(res, 404, { error: 'Case not found' });
      return sendJson(res, 200, detail);
    }

    if (req.method === 'PATCH' && url.pathname.startsWith('/api/checklist-items/')) {
      const itemId = url.pathname.split('/').pop();
      const raw = await readBody(req);
      const payload = JSON.parse(raw.toString() || '{}');
      if (!payload.status) return sendJson(res, 400, { error: 'status is required' });
      const item = updateChecklistItem(itemId, payload.status);
      if (!item) return sendJson(res, 404, { error: 'Checklist item not found' });
      return sendJson(res, 200, item);
    }

    if (req.method === 'POST' && url.pathname.match(/^\/api\/checklist-items\/\d+\/documents$/)) {
      const itemId = url.pathname.split('/')[3];
      const contentType = req.headers['content-type'] || '';
      const boundary = contentType.split('boundary=')[1];
      if (!boundary) return sendJson(res, 400, { error: 'multipart/form-data required' });

      const raw = await readBody(req);
      const parts = parseMultipart(raw, boundary);
      const filePart = parts.find((p) => p.header.includes('name="document"') && p.header.includes('filename='));
      if (!filePart) return sendJson(res, 400, { error: 'document file is required' });

      const filenameMatch = filePart.header.match(/filename="([^"]+)"/);
      const originalName = filenameMatch ? filenameMatch[1] : 'upload.bin';
      const safeName = `${Date.now()}-${originalName.replace(/[^a-zA-Z0-9.\-_]/g, '_')}`;
      const relativePath = path.join('uploads', safeName).replace(/\\/g, '/');
      fs.writeFileSync(path.join(__dirname, relativePath), filePart.body);

      const doc = addChecklistDocument(itemId, originalName, relativePath);
      if (!doc) {
        fs.unlinkSync(path.join(__dirname, relativePath));
        return sendJson(res, 404, { error: 'Checklist item not found' });
      }
      return sendJson(res, 201, doc);
    }

    if (req.method === 'GET' && (url.pathname === '/' || url.pathname === '/cases')) {
      return serveFile(res, path.join(publicDir, 'cases.html'));
    }
    if (req.method === 'GET' && url.pathname.startsWith('/cases/')) {
      return serveFile(res, path.join(publicDir, 'case-detail.html'));
    }
    if (req.method === 'GET' && url.pathname.startsWith('/workers/')) {
      return serveFile(res, path.join(publicDir, 'worker-detail.html'));
    }
    if (req.method === 'GET' && url.pathname.startsWith('/uploads/')) {
      return serveFile(res, path.join(__dirname, url.pathname));
    }

    const staticPath = path.join(publicDir, url.pathname);
    if (req.method === 'GET' && staticPath.startsWith(publicDir) && fs.existsSync(staticPath)) {
      return serveFile(res, staticPath);
    }

    res.writeHead(404);
    res.end('Not found');
  });
}

if (require.main === module) {
  const port = process.env.PORT || 3000;
  createServer().listen(port, () => console.log(`Server running at http://localhost:${port}`));
}

module.exports = { createServer };
