const Reader = require('./productReader.js');
const streamFactory = require('./streams.js');

module.exports.reader = new Reader(streamFactory);
