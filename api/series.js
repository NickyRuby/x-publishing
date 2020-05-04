const express = require('express');
const seriesRouter = express.Router();
const sqlite = require('sqlite3');
const issuesRouter = require('./issue');

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

const validateSeries = (req,res,next) => {
    req.name = req.body.series.name; // надо разобраться почему так 
    req.description = req.body.series.description;
    if (!req.name || !req.description) {
        res.status(400).send()
    } else {
        next();
    }
}

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

seriesRouter.use('/:seriesId/issues',issuesRouter);

seriesRouter.get('/:seriesId', (req,res,next) => {
    res.status(200).json({series: req.seriesData});
});

seriesRouter.post('/', validateSeries, (req,res,next) => {

    let query = "INSERT INTO Series (name, description) VALUES ($name, $description);"
    let data = {$name: req.name, $description: req.description};
    db.run(query,data, function(err) {
        if (err) {
            next(err);
        }
        db.get(`SELECT * FROM Series WHERE Series.id = ${this.lastID}`, (err, series) => {
            if (err) {
                next(err);
            }
            res.status(201).json({series: series});
        })
    })
});




seriesRouter.put('/:seriesId', validateSeries, (req,res,next) => { // !!!!!! — забыл поставить кавычкии 
    db.run(`UPDATE Series SET name = "${req.name}", description = "${req.description}"
        WHERE id = ${req.params.seriesId}`, function (err) {
            if (err) {
                next(err);
            } else {
                db.get(`SELECT * FROM Series WHERE id = ${req.params.seriesId}`, (err, data) => {
                    if (err) {
                        next(err);
                    }
                    res.status(200).json({series: data});
                })
            }
     })
});



module.exports = seriesRouter;
