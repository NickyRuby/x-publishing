const express = require('express');
const seriesRouter = express.Router();
const sqlite = require('sqlite3');

const db = new sqlite.Database(process.env.TEST_DATABASE || './database.sqlite');

seriesRouter.get('/', (req,res,next) => {
    db.all("SELECT * FROM Series;", (err,rows) => {
        if (err) {
            console.log(err);
            next(err);
        }
        res.status(200).json({series: rows});
    });
});

seriesRouter.param('seriesId', (req,res,next,seriesId) => {
    db.get("SELECT * FROM Series WHERE Series.id = $id", { $id: seriesId}, (err, seriesData) => {
        if (err) {
            next(err);
        }
        else if (seriesData) {
            req.seriesData = seriesData;
            next();
        }
        else {
            res.status(404).send('Theres no such series');
        }
    })
})

seriesRouter.get('/:seriesId', (req,res,next) => {
    res.status(200).json({series: req.seriesData});
});

seriesRouter.post('/', (req,res,next) => {

})


module.exports = seriesRouter;
