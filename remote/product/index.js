const api = require('./api/index.js');
const service = require('./service');

module.exports.api = api.create(service);
