const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const morgan = require('morgan');
const errorhandler = require('errorhandler');
const cors = require('cors');
const apiRouter = require('./api/api');

app.use(bodyParser.json());

app.use(morgan('dev'));

app.use(cors());

app.use(errorhandler());

app.use('/api', apiRouter);

const PORT = process.env.PORT || 4001;

app.listen(PORT, () => {
    console.log(`CORS-enabled web server listening on port ${PORT}`)
});

module.exports = app;