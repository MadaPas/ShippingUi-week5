/* eslint-disable no-console */
const env = process.env.NODE_ENV || 'development';
const fs = require('fs');

const dbBase = `${__dirname}/../db`;
const dbPath = `${dbBase}/${env}`;
const productsPath = `${dbPath}/products`;
const cartsPath = `${dbPath}/carts`;


async function init() {
  function mkIfNotExists(dir) {
    return new Promise((resolve, reject) => {
      try {
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir);
        }

        resolve();
      } catch (err) {
        reject(err);
      }
    });
  }

  try {
    await Promise.all([productsPath, cartsPath].map(p => mkIfNotExists(p)));
  } catch (err) {
    console.log('WARNING', 'Error while initializing environment.', err);
  }
}

init();

module.exports = {
  carts: {
    db: cartsPath,
  },
  products: {
    db: productsPath,
  },
};
