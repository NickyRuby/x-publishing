const express = require('express');
const artistsRouter = express.Router();
const sqlite = require('sqlite3');

const db = new sqlite.Database(process.env.TEST_DATABASE || './database.sqlite')

artistsRouter.get('/', (req,res,next) => {
    db.all("SELECT * FROM Artist WHERE Artist.is_currently_employed = 1;", (err,rows) => {
        if (err) {
            console.log(err);
            next(err);
        }
        res.status(200).json({artists: rows});
    });
});

artistsRouter.param('artistId', (req,res,next,artistId) => {
    let artistData = db.get("SELECT * FROM Artists WHERE id=$id;", {$id: artistId}, (err, data) => {
        if (err) {
            next(err);
        }
        return data;
    });

    if (artistData) {
        req.artistData = artistData;
        next();
    }
    else {
        res.status(404).send('There is no such artist');
    }
});

artistsRouter.get('/:artistId', (req,res,nex) => {
    res.send(200).json({artist: req.artistData});
})


module.exports = artistsRouter;