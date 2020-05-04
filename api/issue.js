const express = require('express');
const issuesRouter = express.Router({mergeParams: true});
const sqlite = require('sqlite3');

const db = new sqlite.Database(process.env.TEST_DATABASE || './database.sqlite');

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

// const validateIssue = (req, res, next) => {
//     req.name = req.body.issue.name;
//     req.issueNumber = req.body.issue.issueNumber;
//     req.publicationDate = req.body.issue.publicationDate;
//     req.artistId = req.body.issue.artistId;
//     if (!req.name || !req.issueNumber || !req.publicationDate || !req.artistId) {
//         return res.sendStatus(400);
//     } else {
//         next();
//     }
// };

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
})



// issuesRouter.post('/', validateIssue, (req, res, next) => {
//     db.run(`INSERT INTO Issue (name, issue_number, publication_date, artist_id, series_id) VALUES 
//         ("${req.name}", "${req.issueNumber}", "${req.publicationDate}", ${req.artistId}, ${req.params.seriesId})`,
//         function (error, data) {
//             if (error) {
//                 next(error);
//             } else {
//                 db.get(`SELECT * FROM Issue WHERE id = ${this.lastID}`, (error, data) => {
//                     if (error) {
//                         next(error);
//                     } else {
//                         res.status(201).json({issue: data});
//                     }
//                 });
//             }
//         });
// });

module.exports = issuesRouter;