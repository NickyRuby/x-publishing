const bodyParser = require('body-parser');
const cors = require('cors');
const errorHandler = require('error-handler');
const morgan = require('morgan');
const express = require('express');
const apiRouter = require('./api/api.js');
const artistsRouter = require('./api/artists')

const app = express();
const PORT = process.env.PORT || 4001;

app.use(bodyParser.json());
// app.use(cors());
app.use(morgan('tiny'));
// app.use(errorHandler());

app.use('/api', apiRouter);
app.use('/api/artists', artistsRouter);

app.listen(PORT, () => {
    console.log('Im listening on ' + PORT);
})

module.exports = app;



