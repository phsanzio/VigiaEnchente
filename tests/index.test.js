const test = require('node:test');
const assert = require('node:assert');

process.env.NODE_ENV = 'test';

// importa helpers descripts/index.js
const {
  processFloodData,
  isFlood
} = require('../scripts/index.js');

test('processFloodData retorna [] para input inválido', () => {
  assert.deepStrictEqual(processFloodData(null), []);
  assert.deepStrictEqual(processFloodData({}), []);
  assert.deepStrictEqual(processFloodData({ daily: {} }), []);
});

test('processFloodData retorna primeiros três valores de river_discharge', () => {
  const input = { daily: { river_discharge: [10, 20, 30, 40] } };
  const out = processFloodData(input);
  assert.deepStrictEqual(out, [10, 20, 30]);
});

test('isFlood retorna "baixo" para valores baixos', async () => {
  const savedFetch = global.fetch;
  global.fetch = async () => ({
    ok: true,
    json: async () => ({ daily: { river_discharge: [1, 1, 1] } })
  });

  const result = await isFlood(0, 0);
  assert.strictEqual(result, 'baixo');

  global.fetch = savedFetch;
});

test('isFlood retorna "medio" para valores médios', async () => {
  const savedFetch = global.fetch;
  global.fetch = async () => ({
    ok: true,
    json: async () => ({ daily: { river_discharge: [4, 5, 6] } })
  });

  const result = await isFlood(0, 0);
  assert.strictEqual(result, 'medio');

  global.fetch = savedFetch;
});

test('isFlood retorna "alto" para valores altos', async () => {
  const savedFetch = global.fetch;
  global.fetch = async () => ({
    ok: true,
    json: async () => ({ daily: { river_discharge: [12, 15, 18] } })
  });

  const result = await isFlood(0, 0);
  assert.strictEqual(result, 'alto');

  global.fetch = savedFetch;
});