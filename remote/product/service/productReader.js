/* eslint-disable no-async-promise-executor */
const { products: { db } } = require('../../config');

class Reader {
  constructor({ filesAt, readStream }) {
    this.filesAt = filesAt;
    this.readStream = readStream;
  }

  all() {
    return new Promise(async (resolve, reject) => {
      try {
        const bufs = await this.filesAt(db);
        resolve(bufs.map(buf => JSON.parse(buf)));
      } catch (err) {
        reject(err);
      }
    });
  }

  product(id) {
    return this.readStream(id);
  }
}

module.exports = Reader;
