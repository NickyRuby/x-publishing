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

const validateArtist = (req,res,next) => {
    req.name = req.body.artist.name;
    req.dateOfBirth = req.body.artist.dateOfBirth, 
    req.biography = req.body.artist.biography;
    req.isCurrentlyEmployed = req.body.artist.isCurrentlyEmployed === 0 ? 0 : 1; 
    if (!req.name || !req.dateOfBirth || !req.biography) {
        return res.status(400).send(); // return? почему не просто отравить статус?
    }
    else {
        next();
    }
}

artistsRouter.post('/', validateArtist, (req,res,next) => {
    let query = "INSERT INTO Artist (name,date_of_birth, biography, is_currently_employed) VALUES ($name, $dateOfBirth, $biography, $isCurrentlyEmployed);"
    let data = {$name: req.name, $dateOfBirth: req.dateOfBirth, $biography: req.biography, $isCurrentlyEmployed: req.isCurrentlyEmployed }
    db.run(query, data, function (err) { 
        if (err) {
            next(err);
        }
        db.get("SELECT * FROM Artist WHERE Artist.id=$id;", {$id: this.lastID}, (err, artistData) => {
            if (err) {
                next(err);
            }
            res.status(201).json({artist: artistData});
        });
    })
});

artistsRouter.put('/:artistId', validateArtist, (req,res,next) => {
    let query = "UPDATE Artist SET name = $name, date_of_birth = $dateOfBirth, biography = $biography, is_currently_employed = $isCurrentlyEmployed WHERE id = $id;";
    let data = {
        $name: req.name, 
        $dateOfBirth: req.dateOfBirth, 
        $biography: req.biography, 
        $isCurrentlyEmployed: req.isCurrentlyEmployed, 
        $id: req.params.artistId // req.params.id вместо req.artistData.id
    }

    db.run(query, data, function (err) { 
        if (err) {
            next(err);
        } 
            db.get("SELECT * FROM Artist WHERE id = $id;", {$id: req.params.artistId}, (err, artistData) => { // вместо this.LastID -> req.params.artistId (!!!!!!)
                if (err) {
                    next(err);
                }
                    res.status(200).json({artist: artistData});
            });
        });
       
 });

artistsRouter.delete('/:artistId', (req,res,next) => {

    let query = "UPDATE Artist SET is_currently_employed=$isCurrentlyEmployed WHERE Artist.id=$id;";
    let data = {
        $isCurrentlyEmployed: 0, 
        $id: req.params.artistId
    }

    db.run(query, data, function (err) { 
        if (err) {
            next(err);
        }
        db.get("SELECT * FROM Artist WHERE Artist.id=$id;", {$id: req.params.artistId}, (err, artistData) => {
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