const { v4: uuid } = require('uuid');
const cmd = require('./commands.js');

function stringify(object) {
  return `${JSON.stringify(object)}\n`;
}

function write(id, object) {
  const stream = this.streamFactory.writeStream(id);
  stream.write(stringify(object));
  stream.end();
}

function promisify(cb) {
  return new Promise((resolve, reject) => {
    try {
      resolve(cb());
    } catch (err) {
      reject(err);
    }
  });
}

class Writer {
  constructor(streamFactory) {
    this.streamFactory = streamFactory;
  }

  newCart() {
    const cartId = uuid();
    return promisify(() => {
      write.call(this, cartId, { action: cmd.CREATE_NEW_CART });
      return cartId;
    });
  }

  put(cartId, productId, item, quantity, price) {
    return promisify(() => write.call(this, cartId, {
      action: cmd.ADD_ITEM,
      item: {
        id: productId, item, quantity, price,
      },
    }));
  }

  checkout(cartId) {
    return promisify(() => write.call(this, cartId, { action: cmd.CHECKOUT }));
  }

  delete(cartId) {
    return promisify(() => write.call(this, cartId, { action: cmd.DELETE }));
  }
}


module.exports = Writer;
