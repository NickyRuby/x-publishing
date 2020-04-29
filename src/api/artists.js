const express = require('express');
const artistsRouter = express.Router();
const sqlite = require('sqlite3');
module.exports = artistsRouter;

const db = new sqlite.Database(process.env.TEST_DATABASE || './database.sqlite')

artistsRouter.get('/', (req,res,next) => {
    
})