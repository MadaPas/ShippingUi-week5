const util = require('util');
const fs = require('fs');

const readdirAsync = util.promisify(fs.readdir);
const readFileAsync = util.promisify(fs.readFile);
const { readStreamFor, writeStreamFor } = require('../../commons');
const { products: { db } } = require('../../config');

async function filesAt(path) {
  const files = (await readdirAsync(path))
    .map(n => `${path}/${n}`)
    .map(p => readFileAsync(p));

  return Promise.all(files);
}

module.exports.writeStream = id => writeStreamFor(`${db}/${id}`);

module.exports.readStream = id => readStreamFor(`${db}/${id}`);

module.exports.filesAt = filesAt;
