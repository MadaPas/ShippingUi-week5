const express = require('express');

const router = express.Router();
const { validateItem } = require('./validation');

const rmTrailingSlash = url => url.replace(/\/$/, '');
const location = (base, id) => `${rmTrailingSlash(base)}/${id}`;


function create({ reader, writer }) {
  router.post('/', async (req, res, next) => {
    try {
      const id = await writer.newCart();
      res.setHeader('location', location(req.originalUrl, id));
      res.writeHead(201);
      res.write(JSON.stringify({ id }));
      res.end();
    } catch (err) {
      next(err);
    }
  });

  router.post('/:id', async ({ headers, params: { id }, body }, res, next) => {
    try {
      const contentType = headers['content-type'];

      switch (contentType) {
        case 'application/x-www-form-urlencoded':
        case 'application/json': {
          const validatedItem = validateItem(body);

          if (validatedItem.error) {
            res.writeHead(400);
            const errorMessage = validatedItem.error.details.map(d => d.message);
            res.write(JSON.stringify(errorMessage));
            return res.end();
          }

          const postedCart = validatedItem.value;

          // eslint-disable-next-line radix
          const qty = parseInt(postedCart.quantity);
          const price = parseFloat(postedCart.price);


          await writer.put(id, postedCart.id, postedCart.item, qty, price);
          res.writeHead(204);
          return res.end();
        }

        default:
          res.writeHead(400);
          res.write('Invalid content type.');
          return res.end();
      }
    } catch (err) {
      return next(err);
    }
  });


  router.delete('/:id', async ({ params: { id } }, res, next) => {
    try {
      await writer.delete(id);
      res.writeHead(204);
      res.end();
    } catch (err) {
      next(err);
    }
  });

  router.post('/:id/checkout', async ({ params: { id } }, res, next) => {
    try {
      await writer.checkout(id);
      const cart = await reader.cart(id);

      if (cart === null) {
        next();
      } else {
        res.writeHead(200);
        res.write(JSON.stringify(cart));
        res.end();
      }
    } catch (err) {
      if (err.code === 'ENOENT') { next(); } else { next(err); }
    }
  });

  router.get('/', async (req, res, next) => {
    try {
      const carts = await reader.all();
      res.writeHead(200);
      res.write(JSON.stringify(carts));
      res.end();
    } catch (err) {
      next(err);
    }
  });

  router.get('/:id', async ({ params: { id } }, res, next) => {
    try {
      const cart = await reader.cart(id);

      if (cart && cart !== null) {
        res.writeHead(200);
        res.write(JSON.stringify(cart));
        res.end();
      } else {
        next();
      }
    } catch (err) {
      next(err);
    }
  });

  return router;
}


module.exports.create = create;
