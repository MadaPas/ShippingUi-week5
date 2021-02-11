const fs = require('fs');

module.exports.writeStream = path => fs.createWriteStream(path, { flags: 'a', encoding: 'utf-8' });
module.exports.readStream = path => fs.createReadStream(path, { flags: 'r', encoding: 'utf-8' });
