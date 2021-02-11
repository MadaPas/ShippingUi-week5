const express = require('express');

// other imports
const expressHandlebars = require('express-handlebars');

const app = express();

app.enable('etag');
app.engine('hbs', expressHandlebars({defaultLayout: 'main', extname: '.hbs'}));
app.set('view engine', 'hbs');

app.use(express.static(path.join(__dirname, 'public')));

// Other middleware follows below...
module.exports.app = app;
