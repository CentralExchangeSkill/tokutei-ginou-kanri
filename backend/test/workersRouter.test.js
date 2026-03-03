const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { createApp } = require('../src/server');

const basePayload = {
  name: 'Taro Yamada',
  nationality: 'Japan',
  passport_no: 'P1234567',
  residence_card_no: 'R1234567',
  visa_type: 'Specified Skilled Worker',
  visa_expiry_date: '2027-01-10',
};

test('rejects non-admin requests', async () => {
  const app = createApp();

  const res = await request(app).post('/api/workers').send(basePayload);

  assert.equal(res.status, 403);
});

test('creates worker as admin', async () => {
  const app = createApp();

  const res = await request(app)
    .post('/api/workers')
    .set('x-role', 'ADMIN')
    .send(basePayload);

  assert.equal(res.status, 201);
  assert.equal(res.body.passport_no, basePayload.passport_no);
});

test('prevents duplicate passport number', async () => {
  const app = createApp();

  await request(app).post('/api/workers').set('x-role', 'ADMIN').send(basePayload);

  const duplicateRes = await request(app)
    .post('/api/workers')
    .set('x-role', 'ADMIN')
    .send({
      ...basePayload,
      residence_card_no: 'R9876543',
    });

  assert.equal(duplicateRes.status, 409);
  assert.match(duplicateRes.body.message, /passport_no/);
});
