const assert = require('assert');
const http = require('http');
const express = require('express');
const request = require('supertest');
const { Readable } = require('stream');
const api = require('./api.js');

describe('The Products API', () => {
  let server; let app; let
    router;

  const service = {
    reader: {},
  };

  beforeEach(() => {
    router = api.create(service);
    app = express();
    app.use((req, res, next) => router(req, res, next));
    server = http.createServer(app);
    server.listen(0);
  });

  afterEach(done => {
    server.close(done);
  });

  test('get all products', async () => {
    const products = [{
      id: 'abc', item: 'foo', price: '$12.59', description: 'lorem ipsum',
    }];
    service.reader.all = () => Promise.resolve(products);

    const resp = await request(server)
      .get('/')
      .expect(200);

    assert.deepEqual(JSON.parse(resp.text), products);
  });

  test('get product', async () => {
    const product = {
      id: 'abc', item: 'foo', price: '$12.59', description: 'lorem ipsum',
    };
    const stream = new Readable();
    service.reader.product = () => stream;

    stream.push(JSON.stringify(product));
    stream.push(null);

    const resp = await request(server)
      .get('/abc')
      .expect(200);

    assert.deepEqual(JSON.parse(resp.text), product);
  });
});
