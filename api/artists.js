const express = require('express');
const artistsRouter = express.Router();
const sqlite = require('sqlite3');

const db = new sqlite.Database(process.env.TEST_DATABASE || './database.sqlite');

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
    db.get("SELECT * FROM Artist WHERE Artist.id=$id;", {$id: artistId}, (err, artistData) => {
        if (err) {
            next(err);
        }
        else if (artistData) {
            req.artistData = artistData;
            next();
        }
        else {
            res.status(404).send('There is no such artist');
        }
    });
});

artistsRouter.get('/:artistId', (req,res,next) => {
    res.status(200).json({artist: req.artistData});
});

artistsRouter.post('/', (req,res,next) => {
    let name = req.body.artist.name , dateOfBirth = req.body.artist.dateOfBirth, biography = req.body.artist.biography;
    let isCurrentlyEmployed = req.body.artist.isCurrentlyEmployed === 0 ? 0 : 1; 
    if (!name || !dateOfBirth || !biography) {
        return res.status(400).send();
    }

    let query = "INSERT INTO Artist (name,date_of_birth, biography, is_currently_employed) VALUES ($name, $dateOfBirth, $biography, $isCurrentlyEmployed);"
    let data = {$name: name, $dateOfBirth: dateOfBirth, $biography: biography, $isCurrentlyEmployed: isCurrentlyEmployed }
    db.run(query, data, function (err) { 
        if (err) {
            next(err);
        }
        db.get("SELECT * FROM Artist WHERE Artist.id=$id;", {$id: this.lastID}, (err, artistData) => {
            if (err) {
                next(err);
            }
            else if (artistData) {
                res.status(201).json({artist: artistData});
            }
        });
    })
});

artistsRouter.put('/:artistId', (req,res,next) => {
    let name = req.body.artist.name , dateOfBirth = req.body.artist.dateOfBirth, biography = req.body.artist.biography;
    let isCurrentlyEmployed = req.body.artist.isCurrentlyEmployed === 0 ? 0 : 1; 
    if (!name || !dateOfBirth || !biography) {
        return res.status(400).send();
    }

    let query = "UPDATE Artist SET name = $name, date_of_birth = $dateOfBirth, biography = $biography, is_currently_employed = $isCurrentlyEmployed WHERE id = $id;";
    let data = {
        $name: name, 
        $dateOfBirth: dateOfBirth, 
        $biography: biography, 
        $isCurrentlyEmployed: isCurrentlyEmployed, 
        $id: req.artistData.id
    }

    db.run(query, data, function (err) { 
        if (err) {
            console.log(err);
            next(err);
        }
        db.get("SELECT * FROM Artist WHERE id = $id;", {$id: this.lastID}, (err, artistData) => {
            if (err) {
                next(err);
                console.log(err);
            }
            else if (artistData) {  
                res.status(200).json({artist: artistData});
            }
        });
    })
    });

artistsRouter.delete('/:artistId', (req,res,next) => {

    let query = "UPDATE Artist SET is_currently_employed=$isCurrentlyEmployed WHERE Artist.id=$id;";
    let data = {
        $isCurrentlyEmployed: 0, 
        $id: req.artistData.id
    }

    db.run(query, data, function (err) { 
        if (err) {
            next(err);
        }
        db.get("SELECT * FROM Artist WHERE Artist.id=$id;", {$id: this.lastID}, (err, artistData) => {
            if (err) {
                next(err);
            }
            else if (artistData) {
                res.status(200).json({artist: artistData});
            }
        });
    })
})



module.exports = artistsRouter;