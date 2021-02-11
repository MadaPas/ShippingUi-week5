const assert = require('assert');
const { Readable } = require('stream');
const Reader = require('./productReader.js');

describe('The Product Reader', () => {
  const product = {
    id: '123',
    name: 'foo',
  };

  let reader;
  let stream;

  function stubs() {
    return {
      filesAt: () => Buffer.from(JSON.stringify([product])),
      readStream: () => stream,
    };
  }


  beforeEach(() => {
    stream = new Readable();
    reader = new Reader(stubs());
  });

  test('get all products', async () => {
    const actual = await reader.all();
    assert.deepEqual(JSON.parse(actual), [product]);
  });

  test('get product as stream', done => {
    stream.push(JSON.stringify(product));
    stream.push(null);

    const data = [];
    reader.product('123')
      .on('data', chunk => {
        data.push(chunk);
      })
      .on('end', () => {
        assert.deepEqual(JSON.parse(data), product);
        done();
      });
  });
});
