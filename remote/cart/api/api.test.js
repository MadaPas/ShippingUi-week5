const assert = require('assert');
const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const request = require('supertest');
const api = require('./api.js');

describe('The Carts API', () => {
  let server; let app; let
    router;

  const service = {
    reader: {},
    writer: {},
  };

  beforeEach(() => {
    router = api.create(service);
    app = express();
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use((req, res, next) => router(req, res, next));
    server = http.createServer(app);
    server.listen(0);
  });

  afterEach(done => {
    server.close(done);
  });

  describe('Create New', () => {
    test('create new cart', async () => {
      const cartId = '123';
      service.writer.newCart = () => Promise.resolve(cartId);

      await request(server)
        .post('/')
        .expect(201);
    });

    test('respond with id when cart was created', async () => {
      const cartId = '123';
      service.writer.newCart = () => Promise.resolve(cartId);

      const resp = await request(server)
        .post('/')
        .expect(201);

      assert.deepEqual(JSON.parse(resp.text), { id: cartId });
    });

    test('set location header', async () => {
      const cartId = '123';
      service.writer.newCart = () => Promise.resolve(cartId);

      const { headers: { location } } = await request(server)
        .post('/')
        .expect(201);

      assert.equal(location, '/123');
    });
  });

  describe('Append Item', () => {
    test('reject invalid content type', async () => {
      await request(server)
        .post('/123')
        .expect(400);
    });

    test('add item to cart', async () => {
      service.writer.put = () => Promise.resolve();

      await request(server)
        .post('/123')
        .set('Content-Type', 'application/json')
        .send({
          id: 'abc', item: 'foo', quantity: 3, price: 10.55,
        })
        .expect(204);
    });

    test('add item to cart through html form', async () => {
      service.writer.put = () => Promise.resolve();

      await request(server)
        .post('/123')
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .send('id=abc&item=foo&quantity=3&price=10.55')
        .expect(204);
    });
  });

  describe('Delete', () => {
    test('delete cart', async () => {
      service.writer.delete = () => Promise.resolve();

      await request(server)
        .delete('/123')
        .expect(204);
    });
  });

  describe('Read', () => {
    test('get resource', async () => {
      const cartId = '123';
      const entity = { id: cartId, products: [{ id: 'abc', quantity: 3, price: 9.45 }] };
      service.reader.cart = () => Promise.resolve(entity);

      const resp = await request(server)
        .get('/123')
        .expect(200);

      assert.deepEqual(JSON.parse(resp.text), entity);
    });

    test('get all carts', async () => {
      service.reader.all = () => Promise.resolve(['123']);

      const resp = await request(server)
        .get('/')
        .expect(200);

      assert.deepEqual(JSON.parse(resp.text), ['123']);
    });
  });

  describe('Validation', () => {
    test('reject invalid input when trying to add item', async () => {
      service.writer.put = () => Promise.resolve();

      await request(server)
        .post('/123')
        .set('Content-Type', 'application/json')
        .send({ id: 'abc', item: 'foo', price: 10.55 })
        .expect(400);
    });

    test('reject undefined content type', async () => {
      await request(server)
        .post('/123')
        .send({
          id: 'abc', item: 'foo', quantity: 3, price: 'foo',
        })
        .expect(400);
    });
  });
});
