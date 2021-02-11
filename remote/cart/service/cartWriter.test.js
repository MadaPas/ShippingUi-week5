const assert = require('assert');
const { Writable } = require('stream');
const cmd = require('./commands.js');
const Writer = require('./cartWriter.js');


describe('The cart writer', () => {
  let writer;
  let target;
  function createStream() {
    return new Writable({

      write(chunk, encoding, next) {
        target.push(chunk);
        next();
      },
    });
  }

  function stubStreamFactory() {
    return {
      writeStream: () => createStream(),
    };
  }

  beforeEach(() => {
    target = [];
    writer = new Writer(stubStreamFactory());
  });

  test('return id when resource was created', async () => {
    const id = await writer.newCart();
    assert(id.match(/[\da-h]{8}(-[\da-h]{4}){3}-[\da-h]{12}/));
  });

  test('write command to new resource', async () => {
    await writer.newCart();
    const json = JSON.parse(target[0]);
    assert.equal(json.action, cmd.CREATE_NEW_CART);
  });

  test('add item to cart', async () => {
    const cartId = 'foo';
    const productId = 'bar';
    const item = 'foo bar';
    const quantity = 12;
    const price = 12.95;

    await writer.put(cartId, productId, item, quantity, price);

    const json = JSON.parse(target[0]);
    assert.equal(json.action, cmd.ADD_ITEM);
    assert.equal(json.item.id, 'bar');
    assert.equal(json.item.item, 'foo bar');
    assert.equal(json.item.quantity, 12);
    assert.equal(json.item.price, 12.95);
  });

  test('checkout cart', async () => {
    const cartId = 'foo';
    await writer.checkout(cartId);
    const json = JSON.parse(target[0]);
    assert.equal(json.action, cmd.CHECKOUT);
  });

  test('delete cart', async () => {
    const cartId = 'foo';
    await writer.delete(cartId);
    const json = JSON.parse(target[0]);
    assert.equal(json.action, cmd.DELETE);
  });
});
