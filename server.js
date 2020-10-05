const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const morgan = require('morgan');
const errorhandler = require('errorhandler');
const cors = require('cors');
process.env.NODE_ENV = 'development';

app.use(bodyParser.json());

app.use(morgan('dev'));

app.use(cors());

if (process.env.NODE_ENV === 'development') {
    app.use(errorhandler());
};



const PORT = process.env.PORT || 4001;

app.listen(PORT, () => {
    console.log(`CORS-enabled web server listening on port ${PORT}`)
});

module.exports = app;