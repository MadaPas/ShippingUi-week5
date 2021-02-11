/* eslint-disable no-console */
const { v4: uuid } = require('uuid');
const streamFactory = require('./streamFactory.js');

function appendRequestId(req, res, next) {
  req.requestId = uuid();
  next();
}

function internalServerError(err, req, res, next) {
  if (err.code !== 'ENOENT') {
    console.log(req.requestId.substr(0, 6), err);
    res.writeHead(500);
    res.write(JSON.stringify({ message: 'Internal Error' }));
  }

  next();
}

function notFound(req, res, next) {
  res.writeHead(404);
  res.write(JSON.stringify({ message: 'Not Found' }));
  next();
}

function logRequest(req, res, next) {
  console.log(req.requestId.slice(0, 6),
    new Date().toISOString(),
    req.method,
    req.path,
    JSON.stringify(req.headers));
  next();
}

function logResponse(req, res, next) {
  console.log(req.requestId.slice(0, 6), new Date().toISOString(), res.statusCode);
  next();
}

function writeStreamFor(path) {
  return streamFactory.writeStream(path);
}

function readStreamFor(path) {
  return streamFactory.readStream(path);
}

module.exports = {
  appendRequestId,
  internalServerError,
  notFound,
  logRequest,
  logResponse,
  writeStreamFor,
  readStreamFor,
};
