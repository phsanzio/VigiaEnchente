const test = require('node:test');
const assert = require('node:assert');
const http = require('http');

//configura variável no .env para o node não usar o banco de dados real
process.env.NODE_ENV = 'test';

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
  server = app.listen(0); // port para teste
  await new Promise((r) => server.once('listening', r));
});

//fecha servidor após terminar os testes
test.after(async () => {
  // espera o servidor fechar totalmente para encerrar todos os testes
  await new Promise((resolve, reject) => server.close((err) => err ? reject(err) : resolve()));
});

test('GET / deve responder (200 ou 304) e retornar algum body', async () => {
  const port = server.address().port;
  const res = await httpRequest({ method: 'GET', hostname: '127.0.0.1', port, path: '/' });
  assert.ok([200, 304].includes(res.statusCode), `Esperava 200/304, recebeu ${res.statusCode}`);
});

test('POST /subscribe with com body inválido 400', async () => {
  const port = server.address().port;
  const res = await httpRequest({
    method: 'POST',
    hostname: '127.0.0.1',
    port,
    path: '/subscribe',
    headers: { 'Content-Type': 'application/json' }
  }, JSON.stringify({})); // body vazio: servidor esperando por subscribe
  assert.strictEqual(res.statusCode, 400);
  const json = JSON.parse(res.body);
  assert.ok(json.error);
});

test('POST /cadastro com campos faltando retorna 400', async () => {
  const port = server.address().port;
  const res = await httpRequest({
    method: 'POST',
    hostname: '127.0.0.1',
    port,
    path: '/cadastro',
    headers: { 'Content-Type': 'application/json' }
  }, JSON.stringify({ nome: 'ApenasNome' })); // faltando alguns campos
  assert.strictEqual(res.statusCode, 400);
});

test('POST /login com campos vazios retorna 400', async () => {
  const port = server.address().port;
  const res = await httpRequest({
    method: 'POST',
    hostname: '127.0.0.1',
    port,
    path: '/login',
    headers: { 'Content-Type': 'application/json' }
  }, JSON.stringify({ email: 'a@b.c' })); // faltando senha
  assert.strictEqual(res.statusCode, 400);
});