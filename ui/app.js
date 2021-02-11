const express = require('express');
const expressHandlebars = require('express-handlebars');
const path = require('path');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const {
  v4: uuid
} = require('uuid');
const fetch = require('node-fetch');

const app = express();

app.enable('etag');
app.engine('hbs', expressHandlebars({
  defaultLayout: 'main',
  extname: '.hbs'
}));

app.set('view engine', 'hbs');

app.use(cookieParser());
app.use(session({
  // genid: function(req) {
  //   return genuuid() // use UUIDs for session IDs
  // },
  secret: 'mysecret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 180 * 60 * 1000
  },
  secure: false
}));

app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

app.get('/', function (req, res) {
  res.render('home');
});

app.get('/about', function (req, res) {
  res.render('about');
});

app.get('/products', async function (req, res) {
  if (!req.session.cartId) {
    await fetch('http://localhost:3001/api/carts/', {
        method: 'POST'
      })
      .then(res => res.text())
      .then(body => req.session.cartId = JSON.parse(body).id);
    // console.log(req.session.cartId);
    console.log(req.session.id);
    res.send("Welcome! You created a cart!");
  } else {
    const productsList = await fetch('http://localhost:3001/api/products')
      .then(res => res.text())
      .then(body => JSON.parse(body))
    // console.log(req.session.id);
    // console.log(productsList[0]);
    // res.send(productsList);
    res.render('products', {
      products: productsList,
    });
  }
});

app.get('/cart', function (req, res) {
  res.render('carts');
});

app.use(express.static(path.join(__dirname, 'public')));

// Other middleware follows below...

module.exports.app = app;
