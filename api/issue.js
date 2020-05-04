const express = require('express');
const issuesRouter = express.Router({mergeParams: true});
const sqlite = require('sqlite3');

const db = new sqlite.Database(process.env.TEST_DATABASE || './database.sqlite');

issuesRouter.param('issueId', (req,res,next,issueId) => {
    db.get(`SELECT * FROM Issue WHERE id=${issueId};`, (err, data) => {
        if (!data) {
            res.status(404).send()
        } else {
            req.issueId = issueId;
            next();
        }
    })
})

issuesRouter.get('/', (req,res,next) => {
    db.all(`SELECT * FROM Issue WHERE series_id = ${req.params.seriesId}`, (err, issues) => {
        if (err) {
            next(err);
        } else {
            res.status(200).json({issues: issues});
        }
     })
});

const validateIssue = (req, res, next) => {
    req.name = req.body.issue.name;
    req.issueNumber = req.body.issue.issueNumber;
    req.publicationDate = req.body.issue.publicationDate;
    req.artistId = req.body.issue.artistId;
    if (!req.name || !req.issueNumber || !req.publicationDate || !req.artistId) {
        return res.status(400).send();
    } 
    else {
        next();
    }
    
}


issuesRouter.post('/', validateIssue, (req,res,next) => {
    let query = `INSERT INTO Issue (name, issue_number, publication_date, artist_id, series_id) 
    VALUES ("${req.name}", "${req.issueNumber}", "${req.publicationDate}", ${req.artistId}, ${req.params.seriesId});`;
    db.run(query, function(err) {
        if (err) {
            next(err)
        }
        else {
            db.get(`SELECT * FROM Issue WHERE id=${this.lastID}`, (err, issue) => {
                if (err) {
                    next(err)
                } else {
                    res.status(201).json({issue: issue});
                }
            })
        }
    })
});

issuesRouter.put('/:issueId', validateIssue, (req,res,next) => {
    let query = `UPDATE Issue SET 
    name="${req.name}", 
    issue_number="${req.issueNumber}", 
    publication_date="${req.publicationDate}",
    artist_id=${req.artistId}
    WHERE id=${req.issueId};`;
    db.run(query, function(err){
        if (err) {
            next(err)
        } else {
            db.get(`SELECT * FROM Issue WHERE id = ${req.params.issueId}`, (err, issue) => {
                if (err) {
                    next(err)
                }
                else {
                    res.status(200).json({issue: issue});
                }
            })
        }
    })
 });

 issuesRouter.delete('/:issueId', (req,res,next) => {
    let query = `DELETE FROM Issue WHERE id = ${req.params.issueId}`;
    db.run(query, function(err){
        if (err) {
            next(err)
        } else {
            res.status(204).send();
        }
    })
 });


module.exports = issuesRouter;