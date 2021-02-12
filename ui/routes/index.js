const express = require('express');
const fetch = require('node-fetch');

const router = express.Router();

router.get('/', function (req, res) {
    console.log(req.session.id);
    if (!req.session.cartId) {
      res.render('home', {
        nav: [
          { url: "/", title: "Home" },
          { url: "/about", title: "About" }
        ]
      });
    } else {
      res.render('home', {
        nav: [
          { url: "/", title: "Home" },
          { url: "/products", title: "Products" },
          { url: `/carts/${req.session.cartId}`, title: "Cart" },
          { url: "/about", title: "About" }
        ]
      });
    }
  });
  
router.get('/about', function (req, res) {
  res.render('about', {
    nav: [
      { url: "/", title: "Home" },
      { url: "/products", title: "Products" },
      { url: `/carts/${req.session.cartId}`, title: "Cart" },
      { url: "/about", title: "About" }
    ]
  });
});

router.get('/products', async function (req, res) {
  if (!req.session.cartId) {
    await fetch('http://localhost:3001/api/carts/', {
        method: 'POST'
      })
      .then(res => res.text())
      .then(body => req.session.cartId = JSON.parse(body).id);
  }
  const productsList = await fetch('http://localhost:3001/api/products')
    .then(res => res.text())
    .then(body => JSON.parse(body))
  console.log(req.session.id);
  res.render('products', {
    products: productsList,
    product: {},
    nav: [
      { url: "/", title: "Home" },
      { url: "/products", title: "Products" },
      { url: `/carts/${req.session.cartId}`, title: "Cart" },
      { url: "/about", title: "About" }
    ]
  });
});

router.get(`/products/:id`, async function (req, res) {
  if (req.session.cartId) {
    let id = req.params.id;
    const productInfo = await fetch(`http://localhost:3001/api/products/${id}`)
      .then(res => res.text())
      .then(body => JSON.parse(body))
      // console.log(productInfo);
    res.render('product', {
      product: productInfo,
      nav: [
        { url: "/", title: "Home" },
        { url: "/products", title: "Products" },
        { url: `/carts/${req.session.cartId}`, title: "Cart" },
        { url: "/about", title: "About" }
      ]
    });
  } else {
    res.send('Something happened. Try again!')
  }
});

router.post(`/products/:id`, async function (req, res) {
  try {
    const productInfo = await fetch(`http://localhost:3001/api/products/${req.params.id}`)
      .then(res => res.text())
      .then(body => JSON.parse(body))
    const product = {
      id: productInfo.id,
      item: productInfo.item,
      quantity: req.body.qty,
      price: productInfo.price,
    };
    console.log(product);
    await fetch(`http://localhost:3001/api/carts/${req.session.cartId}`, {
          method: 'POST',
          body:    JSON.stringify(product),
          headers: { 'Content-Type': 'application/json' },
      })
    res.status(204);
    res.end();
  } catch (err) {
    res.status(500);
    res.end();
  }
});
  
router.get('/carts/:id', async function (req, res) {
  try {
    const cart = await fetch(`http://localhost:3001/api/carts/${req.session.cartId}`)
      .then(res => res.text())
      .then(body => JSON.parse(body));
    res.render('carts', {
      products: cart.products,
      nav: [
        { url: "/", title: "Home" },
        { url: "/products", title: "Products" },
        { url: `/carts/${req.session.cartId}`, title: "Cart" },
        { url: "/about", title: "About" }
      ]
    });
  } catch (err) {
    res.status(500);
    res.end();
  }
});

module.exports = router;