const express = require('express');

const router = express.Router();

function create({ reader }) {
  router.get('/', async (req, res, next) => {
    try {
      const products = await reader.all();
      res.writeHead(200);
      res.write(JSON.stringify(products));
      res.end();
    } catch (err) {
      next(err);
    }
  });

  router.get('/:id', ({ params: { id } }, res, next) => {
    reader
      .product(id)
      .on('error', err => {
        if (err.code === 'ENOENT') { next(); } else { next(err); }
      })
      .pipe(res);
  });

  return router;
}

module.exports.create = create;
