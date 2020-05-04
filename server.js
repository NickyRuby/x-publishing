const bodyParser = require('body-parser');
const cors = require('cors');
const errorHandler = require('error-handler');
const morgan = require('morgan');
const express = require('express');
const apiRouter = require('./api/api.js');
const seriesRouter = require('./api/series');
const artistsRouter = require('./api/artists')
const issuesRouter = require('./api/issue');

const app = express();
const PORT = process.env.PORT || 4001;

app.use(bodyParser.json());
// app.use(cors());
app.use(morgan('tiny'));
// app.use(errorHandler());

app.use('/api', apiRouter);
app.use('/api/artists', artistsRouter);
app.use('/api/series', seriesRouter)
// app.use('/api/series/:seriesId/issues', issuesRouter);

app.listen(PORT, () => {
    console.log('Im listening on ' + PORT);
})

module.exports = app;



