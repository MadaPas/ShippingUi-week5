/* eslint-disable no-param-reassign */
/* eslint-disable no-console */
const readline = require('readline');
const cmd = require('./commands.js');


function filterItemId(cart, itemId) {
  return cart
    .products
    .filter(itm => itm.id === itemId);
}

function reduceQuantity(items, seed) {
  return items
    .map(itm => itm.quantity)
    .reduce((a, b) => a + b, seed);
}

function createNewCart(id) {
  return {
    id,
    open: true,
    products: [],
  };
}

function addQuantity(item, items) {
  const originalPrice = item.price;
  const tot = reduceQuantity(items, item.quantity);
  items.forEach(itm => {
    itm.quantity = tot;
    itm.price = tot * originalPrice;
  });
}

function appendItemToCart({ item }, cart) {
  const items = filterItemId(cart, item.id);

  if (items.length > 0) {
    addQuantity(item, items);
  } else {
    cart.products.push(item);
  }
}


class Reader {
  constructor(streamFactory) {
    this.streamFactory = streamFactory;
  }

  cart(id) {
    return new Promise((resolve, reject) => {
      let cart = {};

      const stream = this.streamFactory.readStream(id);

      stream.on('error', err => {
        reject(err);
      });

      const rli = readline.createInterface({
        input: stream,
      });

      rli.on('line', line => {
        const event = JSON.parse(line);

        switch (event.action) {
          case cmd.CREATE_NEW_CART:
            cart = createNewCart(id);
            break;

          case cmd.ADD_ITEM: {
            appendItemToCart(event, cart);
            break;
          }

          case cmd.DELETE: {
            cart = null;
            rli.close();
            stream.destroy();
            break;
          }

          case cmd.CHECKOUT: {
            if (cart !== null) {
              cart.open = false;
            }
            rli.close();
            stream.destroy();
            break;
          }

          default:
            console.log('WARNING', `Unexpected event when reading Cart[id: ${id}]`);
        }

        rli.on('close', () => {
          resolve(cart);
        });
      });
    });
  }

  all() {
    return this.streamFactory.carts();
  }
}

module.exports = Reader;
