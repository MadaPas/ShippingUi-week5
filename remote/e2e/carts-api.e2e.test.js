/* eslint-disable no-restricted-syntax */
const assert = require('assert');
const request = require('supertest');
const { readdir, unlink } = require('fs');
const { join } = require('path');
const { createServer } = require('http');
const { app } = require('../app.js');

describe('The Carts API', () => {
  let server;

  function cleanCartsDb() {
    const directory = `${__dirname}/../db/test/carts`;
    readdir(directory, (err, files) => {
      if (err) throw err;

      for (const file of files) {
        unlink(join(directory, file), e => {
          if (e) throw e;
        });
      }
    });
  }

  beforeEach(() => {
    cleanCartsDb();
    server = createServer(app);
    server.listen(0);
  });

  afterEach(done => {
    server.close(done);
  });

  test('create new cart', async () => {
    const resp = await request(server)
      .post('/api/carts')
      .expect(201);

    const { text, headers: { location } } = resp;
    const { id } = JSON.parse(text);
    assert(/[\da-h]{8}(-[\da-h]{4}){3}-[\da-h]{12}/.test(id));
    assert.equal(location, `/api/carts/${id}`);
  });

  test('reject invalid content type', async () => {
    const resp = await request(server)
      .post('/api/carts')
      .expect(201);

    const { id } = JSON.parse(resp.text);

    await request(server)
      .post(`/api/carts/${id}`)
      .expect(400);
  });

  test('create -> add item as json -> get content', async () => {
    const r0 = await request(server)
      .post('/api/carts')
      .expect(201);

    const { id } = JSON.parse(r0.text);

    const product = {
      id: '2f81a686-7531-11e8-86e5-f0d5bf731f68', item: 'Keychain Phone Charger', quantity: 3, price: 10.53,
    };

    await request(server)
      .post(`/api/carts/${id}`)
      .set('Content-Type', 'application/json')
      .send(product)
      .expect(204);

    const r2 = await request(server)
      .get(`/api/carts/${id}`)
      .expect(200);

    const { products } = JSON.parse(r2.text);

    assert.deepEqual(products[0], product);
  });

  test('create -> add item as html form -> get content', async () => {
    const r0 = await request(server)
      .post('/api/carts')
      .expect(201);

    const { id } = JSON.parse(r0.text);

    const product = {
      id: '2f81a686-7531-11e8-86e5-f0d5bf731f68', item: 'Keychain Phone Charger', quantity: 3, price: 10.53,
    };

    await request(server)
      .post(`/api/carts/${id}`)
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .send(`id=${product.id}&item=${product.item}&quantity=${product.quantity}&price=${product.price}`)
      .expect(204);

    const r2 = await request(server)
      .get(`/api/carts/${id}`)
      .expect(200);

    const { products } = JSON.parse(r2.text);

    assert.deepEqual(products[0], product);
  });

  test('create -> get -> delete -> get -> delete', async () => {
    const r0 = await request(server)
      .post('/api/carts')
      .expect(201);

    const { id } = JSON.parse(r0.text);

    await request(server).get(`/api/carts/${id}`).expect(200);
    await request(server).delete(`/api/carts/${id}`).expect(204);
    await request(server).get(`/api/carts/${id}`).expect(404);
    await request(server).delete(`/api/carts/${id}`).expect(204);
  });

  test('add many items', async () => {
    const r0 = await request(server)
      .post('/api/carts')
      .expect(201);

    const { id } = JSON.parse(r0.text);

    const i1 = {
      id: '2f81a686-7531-11e8-86e5-f0d5bf731f68', item: 'Keychain Phone Charger', quantity: 3, price: 10.53,
    };

    await request(server)
      .post(`/api/carts/${id}`)
      .set('Content-Type', 'application/json')
      .send(i1)
      .expect(204);

    const i2 = {
      id: '39ac2118-7531-11e8-86e5-f0d5bf731f68', item: 'Coffee Mug', quantity: 1, price: 1.0,
    };

    await request(server)
      .post(`/api/carts/${id}`)
      .set('Content-Type', 'application/json')
      .send(i2)
      .expect(204);

    const i3 = {
      id: i1.id, quantity: 1, item: i1.item, price: i1.price,
    };

    await request(server)
      .post(`/api/carts/${id}`)
      .set('Content-Type', 'application/json')
      .send(i3)
      .expect(204);

    const r4 = await request(server)
      .get(`/api/carts/${id}`)
      .expect(200);

    const { products } = JSON.parse(r4.text);

    assert.equal(products.length, 2);

    const [{ quantity, price }] = products.filter(p => p.id === i1.id);
    assert.equal(quantity, i1.quantity + i3.quantity);

    const expPrice = i1.quantity * i1.price + i3.quantity * i3.price;
    assert.equal(price, expPrice);
  });

  test('add item and validate price', async () => {
    const r0 = await request(server)
      .post('/api/carts')
      .expect(201);

    const { id } = JSON.parse(r0.text);

    const i1 = {
      id: '2f81a686-7531-11e8-86e5-f0d5bf731f68', item: 'Keychain Phone Charger', quantity: 3, price: 'bogus',
    };

    await request(server)
      .post(`/api/carts/${id}`)
      .set('Content-Type', 'application/json')
      .send(i1)
      .expect(400);
  });

  test('add item and validate quantity', async () => {
    const r0 = await request(server)
      .post('/api/carts')
      .expect(201);

    const { id } = JSON.parse(r0.text);

    const i1 = {
      id: '2f81a686-7531-11e8-86e5-f0d5bf731f68', item: 'Keychain Phone Charger', quantity: 'bogus', price: 10.5,
    };

    await request(server)
      .post(`/api/carts/${id}`)
      .set('Content-Type', 'application/json')
      .send(i1)
      .expect(400);
  });
});
