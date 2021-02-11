const Writer = require('./cartWriter.js');
const Reader = require('./cartReader.js');
const streamFactory = require('./streams.js');

module.exports.writer = new Writer(streamFactory);
module.exports.reader = new Reader(streamFactory);
