const test = require('node:test');
const assert = require('node:assert');
const http = require('http');

process.env.NODE_ENV = 'test';

// require after setting NODE_ENV so server uses test-mode db/store
const { app } = require('../server.js');

function httpRequest(options, body) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, headers: res.headers, body: data }));
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

let server;
test.before(async () => {
  server = app.listen(0); // ephemeral port
  await new Promise((r) => server.once('listening', r));
});

test.after(async () => {
  // wait for server to fully close so tests exit cleanly
  await new Promise((resolve, reject) => server.close((err) => err ? reject(err) : resolve()));
});

test('GET / should respond (200 or 304) and return some body', async () => {
  const port = server.address().port;
  const res = await httpRequest({ method: 'GET', hostname: '127.0.0.1', port, path: '/' });
  assert.ok([200, 304].includes(res.statusCode), `Expected 200/304, got ${res.statusCode}`);
});

test('POST /subscribe with invalid body returns 400', async () => {
  const port = server.address().port;
  const res = await httpRequest({
    method: 'POST',
    hostname: '127.0.0.1',
    port,
    path: '/subscribe',
    headers: { 'Content-Type': 'application/json' }
  }, JSON.stringify({})); // empty body -> server expects subscription
  assert.strictEqual(res.statusCode, 400);
  const json = JSON.parse(res.body);
  assert.ok(json.error);
});

test('POST /cadastro missing fields returns 400', async () => {
  const port = server.address().port;
  const res = await httpRequest({
    method: 'POST',
    hostname: '127.0.0.1',
    port,
    path: '/cadastro',
    headers: { 'Content-Type': 'application/json' }
  }, JSON.stringify({ nome: 'ApenasNome' })); // missing other fields
  assert.strictEqual(res.statusCode, 400);
});

test('POST /login missing fields returns 400', async () => {
  const port = server.address().port;
  const res = await httpRequest({
    method: 'POST',
    hostname: '127.0.0.1',
    port,
    path: '/login',
    headers: { 'Content-Type': 'application/json' }
  }, JSON.stringify({ email: 'a@b.c' })); // missing senha
  assert.strictEqual(res.statusCode, 400);
});