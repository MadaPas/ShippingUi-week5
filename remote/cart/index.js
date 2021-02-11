const service = require('./service');
const api = require('./api');

module.exports.api = api.create(service);
