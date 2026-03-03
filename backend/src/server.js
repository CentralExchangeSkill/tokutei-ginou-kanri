const express = require('express');
const { WorkerRepository } = require('./workerRepository');
const { createWorkersRouter } = require('./workersRouter');

function createApp() {
  const app = express();
  const workerRepository = new WorkerRepository();

  app.use(express.json());
  app.use('/api/workers', createWorkersRouter(workerRepository));

  return app;
}

if (require.main === module) {
  const app = createApp();
  const port = process.env.PORT || 3001;

  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Backend running on :${port}`);
  });
}

module.exports = { createApp };
