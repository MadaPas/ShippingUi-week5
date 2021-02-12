const express = require('express');
const expressHandlebars = require('express-handlebars');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
// const cookieParser = require('cookie-parser');
const {
  v4: uuid
} = require('uuid');
const routes = require('./routes');

const app = express();

app.enable('etag');
app.engine('hbs', expressHandlebars({
  defaultLayout: 'main',
  extname: '.hbs'
}));

app.set('view engine', 'hbs');

// app.use(cookieParser());
app.use(session({
  secret: 'mysecret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 180 * 60 * 1000
  },
  secure: false
}));

app.use(bodyParser.urlencoded({
  extended: false,
}));
app.use(bodyParser.json());

app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

app.use('/', routes);

app.use(express.static(path.join(__dirname, 'public')));

module.exports.app = app;
