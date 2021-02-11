const fs = require('fs');
const { writeStreamFor, readStreamFor } = require('../../commons');
const { carts: { db } } = require('../../config');

function allCarts() {
  return new Promise((resolve, reject) => {
    fs.readdir(db, (err, files) => {
      if (err) {
        reject(err);
      } else {
        resolve(files);
      }
    });
  });
}

module.exports.writeStream = id => writeStreamFor(`${db}/${id}`);

module.exports.readStream = id => readStreamFor(`${db}/${id}`);

module.exports.carts = allCarts;
