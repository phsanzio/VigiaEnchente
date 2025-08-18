const test = require('node:test');
const assert = require('node:assert');

process.env.NODE_ENV = 'test';

// import helpers from scripts/index.js (now exports helpers)
const {
  processFloodData,
  isFlood
} = require('../scripts/index.js');

test('processFloodData returns [] for invalid input', () => {
  assert.deepStrictEqual(processFloodData(null), []);
  assert.deepStrictEqual(processFloodData({}), []);
  assert.deepStrictEqual(processFloodData({ daily: {} }), []);
});

test('processFloodData returns first three river_discharge values', () => {
  const input = { daily: { river_discharge: [10, 20, 30, 40] } };
  const out = processFloodData(input);
  assert.deepStrictEqual(out, [10, 20, 30]);
});

test('isFlood returns "baixo" for low stable values', async () => {
  const savedFetch = global.fetch;
  global.fetch = async () => ({
    ok: true,
    json: async () => ({ daily: { river_discharge: [1, 1, 1] } })
  });

  const result = await isFlood(0, 0);
  assert.strictEqual(result, 'baixo');

  global.fetch = savedFetch;
});

test('isFlood returns "medio" for medium/varied values', async () => {
  const savedFetch = global.fetch;
  global.fetch = async () => ({
    ok: true,
    json: async () => ({ daily: { river_discharge: [4, 5, 6] } })
  });

  const result = await isFlood(0, 0);
  assert.strictEqual(result, 'medio');

  global.fetch = savedFetch;
});

test('isFlood returns "alto" for high values', async () => {
  const savedFetch = global.fetch;
  global.fetch = async () => ({
    ok: true,
    json: async () => ({ daily: { river_discharge: [12, 15, 18] } })
  });

  const result = await isFlood(0, 0);
  assert.strictEqual(result, 'alto');

  global.fetch = savedFetch;
});