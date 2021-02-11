const assert = require('assert');
const { Readable } = require('stream');
const Reader = require('./cartReader.js');
const cmd = require('./commands.js');

describe('The cart reader', () => {
  let reader;
  let stream;

  function stringify(object) {
    return `${JSON.stringify(object)}\n`;
  }

  function stubStreamFactory() {
    return {
      readStream: () => stream,
    };
  }


  beforeEach(() => {
    stream = new Readable();
    reader = new Reader(stubStreamFactory());
  });

  test('read empty cart', async () => {
    const id = '123';
    stream.push(stringify({ action: cmd.CREATE_NEW_CART }));
    stream.push(null);

    const cart = await reader.cart(id);
    assert.deepEqual(cart, { id, open: true, products: [] });
  });

  test('read all products in cart', async () => {
    const id = '123';
    stream.push(stringify({ action: cmd.CREATE_NEW_CART }));
    stream.push(stringify({ action: cmd.ADD_ITEM, item: { id: 'abc', quantity: 1, price: 10.5 } }));
    stream.push(stringify({ action: cmd.ADD_ITEM, item: { id: 'def', quantity: 2, price: 25 } }));
    stream.push(null);

    const cart = await reader.cart(id);
    assert.deepEqual(cart.products, [{ id: 'abc', quantity: 1, price: 10.5 }, { id: 'def', quantity: 2, price: 25 }]);
  });

  test('add products with the same id', async () => {
    const id = '123';
    stream.push(stringify({ action: cmd.CREATE_NEW_CART }));
    stream.push(stringify({ action: cmd.ADD_ITEM, item: { id: 'abc', quantity: 1, price: 10.5 } }));
    stream.push(stringify({ action: cmd.ADD_ITEM, item: { id: 'def', quantity: 2, price: 25 } }));
    stream.push(stringify({ action: cmd.ADD_ITEM, item: { id: 'abc', quantity: 3, price: 10.5 } }));
    stream.push(stringify({ action: cmd.ADD_ITEM, item: { id: 'abc', quantity: -2, price: 10.5 } }));
    stream.push(null);

    const cart = await reader.cart(id);
    assert.deepEqual(cart.products, [{ id: 'abc', quantity: 2, price: 21 }, { id: 'def', quantity: 2, price: 25 }]);
  });

  test('remove deleted carts', async () => {
    const id = '123';
    stream.push(stringify({ action: cmd.CREATE_NEW_CART }));
    stream.push(stringify({ action: cmd.ADD_ITEM, item: { id: 'abc', quantity: 1 } }));
    stream.push(stringify({ action: cmd.ADD_ITEM, item: { id: 'def', quantity: 2 } }));
    stream.push(stringify({ action: cmd.DELETE, item: { id: 'abc', quantity: 3 } }));
    stream.push(stringify({ action: cmd.ADD_ITEM, item: { id: 'abc', quantity: 1 } }));
    stream.push(null);

    const cart = await reader.cart(id);
    assert.equal(cart, null);
  });

  test('not append to a checked out cart', async () => {
    const id = '123';
    stream.push(stringify({ action: cmd.CREATE_NEW_CART }));
    stream.push(stringify({ action: cmd.ADD_ITEM, item: { id: 'abc', quantity: 1 } }));
    stream.push(stringify({ action: cmd.ADD_ITEM, item: { id: 'def', quantity: 2 } }));
    stream.push(stringify({ action: cmd.CHECKOUT }));
    stream.push(stringify({ action: cmd.ADD_ITEM, item: { id: 'abc', quantity: 1 } }));
    stream.push(null);

    const cart = await reader.cart(id);
    assert.deepEqual(cart.products, [{ id: 'abc', quantity: 1 }, { id: 'def', quantity: 2 }]);
  });

  test('be open while not checked out', async () => {
    const id = '123';
    stream.push(stringify({ action: cmd.CREATE_NEW_CART }));
    stream.push(stringify({ action: cmd.ADD_ITEM, item: { id: 'abc', quantity: 1 } }));
    stream.push(null);

    const cart = await reader.cart(id);
    assert.equal(cart.open, true);
  });

  test('not be open when checked out', async () => {
    const id = '123';
    stream.push(stringify({ action: cmd.CREATE_NEW_CART }));
    stream.push(stringify({ action: cmd.ADD_ITEM, item: { id: 'abc', quantity: 1 } }));
    stream.push(stringify({ action: cmd.CHECKOUT }));
    stream.push(null);

    const cart = await reader.cart(id);
    assert.equal(cart.open, false);
  });
});
