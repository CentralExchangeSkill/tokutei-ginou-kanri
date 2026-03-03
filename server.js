const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;

/**
 * Worker model:
 * {
 *   id: number,
 *   name: string,
 *   nationality: string,
 *   visa_expiry_date: string (YYYY-MM-DD)
 * }
 */
const workers = [
  { id: 1, name: 'Nguyen Van A', nationality: 'Vietnam', visa_expiry_date: '2026-03-15' },
  { id: 2, name: 'Sokha Chan', nationality: 'Cambodia', visa_expiry_date: '2026-01-05' },
  { id: 3, name: 'Rizki Putra', nationality: 'Indonesia', visa_expiry_date: '2026-06-20' }
];

const parseDate = (value) => {
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(date.valueOf()) ? null : date;
};

const sortByVisaExpiryAsc = (list) => list.slice().sort((a, b) => {
  const dateA = parseDate(a.visa_expiry_date);
  const dateB = parseDate(b.visa_expiry_date);
  return dateA - dateB;
});

const sendJson = (res, statusCode, payload) => {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(payload));
};

const sendFile = (res, filePath, contentType) => {
  const fullPath = path.join(__dirname, filePath);
  fs.readFile(fullPath, (error, data) => {
    if (error) {
      sendJson(res, 404, { message: 'Not found' });
      return;
    }

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
};

const collectBody = (req) => new Promise((resolve, reject) => {
  let body = '';

  req.on('data', (chunk) => {
    body += chunk.toString();
  });

  req.on('end', () => {
    if (!body) {
      resolve({});
      return;
    }

    try {
      resolve(JSON.parse(body));
    } catch (_error) {
      reject(new Error('Invalid JSON body'));
    }
  });
});

const server = http.createServer(async (req, res) => {
  const requestUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = requestUrl.pathname;
  const method = req.method;
  const accept = req.headers.accept || '';

  if (method === 'GET' && pathname === '/') {
    res.writeHead(302, { Location: '/workers' });
    res.end();
    return;
  }

  if (method === 'GET' && pathname === '/styles.css') {
    sendFile(res, 'public/styles.css', 'text/css');
    return;
  }

  if (method === 'GET' && pathname === '/workers' && accept.includes('text/html')) {
    sendFile(res, 'public/workers.html', 'text/html');
    return;
  }

  if (method === 'GET' && pathname === '/workers') {
    sendJson(res, 200, sortByVisaExpiryAsc(workers));
    return;
  }

  const workerIdMatch = pathname.match(/^\/workers\/(\d+)$/);
  if (method === 'GET' && workerIdMatch && accept.includes('text/html')) {
    sendFile(res, 'public/worker-detail.html', 'text/html');
    return;
  }

  if (method === 'GET' && workerIdMatch) {
    const workerId = Number.parseInt(workerIdMatch[1], 10);
    const worker = workers.find((item) => item.id === workerId);

    if (!worker) {
      sendJson(res, 404, { message: 'Worker not found' });
      return;
    }

    sendJson(res, 200, worker);
    return;
  }

  if (method === 'POST' && pathname === '/workers') {
    if (req.headers['x-user-role'] !== 'admin') {
      sendJson(res, 403, { message: 'Admin role required' });
      return;
    }

    try {
      const payload = await collectBody(req);
      const { name, nationality, visa_expiry_date: visaExpiryDate } = payload;

      if (!name || !nationality || !visaExpiryDate) {
        sendJson(res, 400, { message: 'name, nationality and visa_expiry_date are required' });
        return;
      }

      if (!parseDate(visaExpiryDate)) {
        sendJson(res, 400, { message: 'visa_expiry_date must be a valid YYYY-MM-DD date' });
        return;
      }

      const newWorker = {
        id: workers.length > 0 ? Math.max(...workers.map((item) => item.id)) + 1 : 1,
        name,
        nationality,
        visa_expiry_date: visaExpiryDate
      };

      workers.push(newWorker);
      sendJson(res, 201, newWorker);
    } catch (_error) {
      sendJson(res, 400, { message: 'Invalid JSON body' });
    }
    return;
  }

  sendJson(res, 404, { message: 'Not found' });
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
