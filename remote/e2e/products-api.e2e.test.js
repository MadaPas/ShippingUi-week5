const assert = require('assert');
const request = require('supertest');
const http = require('http');
const { app } = require('../app.js');

describe('The Products API', () => {
  let server;

  beforeEach(() => {
    server = http.createServer(app);
    server.listen(0);
  });

  afterEach(done => {
    server.close(done);
  });

  test('get all products', async () => {
    const resp = await request(server)
      .get('/api/products/')
      .expect(200);

    assert.equal(JSON.parse(resp.text).length, 6);
  });

  test('get one product', async () => {
    const resp = await request(server)
      .get('/api/products/2f81a686-7531-11e8-86e5-f0d5bf731f68')
      .expect(200);

    const { id, item, price } = JSON.parse(resp.text);

    assert.equal(id, '2f81a686-7531-11e8-86e5-f0d5bf731f68');
    assert.equal(item, 'Keychain Phone Charger');
    assert.equal(price, '29.99');
  });

  test('not found', async () => {
    await request(server)
      .get('/api/products/foo')
      .expect(404);
  });
});
