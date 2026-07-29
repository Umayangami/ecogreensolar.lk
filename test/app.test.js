const test = require('node:test');
const assert = require('node:assert/strict');

const { createApp } = require('../app');

test('createApp returns an Express app even when DB settings are missing', () => {
  delete process.env.DB_HOST;
  delete process.env.DB_PORT;
  delete process.env.DB_USER;
  delete process.env.DB_PASSWORD;
  delete process.env.DB_NAME;

  const app = createApp();

  assert.ok(app);
  assert.equal(typeof app.handle, 'function');
});
