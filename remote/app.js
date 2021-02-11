const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const product = require('./product');
const cart = require('./cart');
const commons = require('./commons');

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(commons.appendRequestId);
app.use(commons.logRequest);

app.use('/api/products', product.api);
app.use('/api/carts', cart.api);

app.use(commons.internalServerError);
app.use(commons.notFound);

app.use(commons.logResponse);
app.use((_, res) => res.end());

module.exports.app = app;
