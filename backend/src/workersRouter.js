const express = require('express');
const { workerSchema } = require('./workerSchema');
const { requireAdmin } = require('./authz');

function createWorkersRouter(workerRepository) {
  const router = express.Router();

  router.post('/', requireAdmin, (req, res) => {
    const result = workerSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: 'Validation error',
        errors: result.error.flatten().fieldErrors,
      });
    }

    const payload = result.data;

    if (workerRepository.findByPassportNo(payload.passport_no)) {
      return res.status(409).json({
        message: 'passport_no already exists',
      });
    }

    if (workerRepository.findByResidenceCardNo(payload.residence_card_no)) {
      return res.status(409).json({
        message: 'residence_card_no already exists',
      });
    }

    const created = workerRepository.create(payload);
    return res.status(201).json(created);
  });

  return router;
}

module.exports = { createWorkersRouter };
