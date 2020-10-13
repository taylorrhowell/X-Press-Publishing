const express = require('express');
const artistRouter = express.Router();
const sqlite3 = require('sqlite3');
const apiRouter = require('./api');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

artistRouter.param('artistId', (req, res, next, Id) => {
    db.get("SELECT * FROM Artist WHERE Artist.id = $id;", {
        $id: Id
    }, (err, artist) => {
        if (err) {
            next(err);
        } else if (artist) {
            req.artist = artist;
            next();
        } else {
            res.sendStatus(404);
        }
    });
});

artistRouter.get('/', (req, res, next) => {
    db.all("SELECT * FROM Artist WHERE Artist.is_currently_employed = 1;", (err, artists) => {
        if (err) {
            next(err);
        } else {
            res.status(200).json({ artists: artists})
        }
    });
});

artistRouter.get('/:artistId', (req, res, next) => {
    res.status(200).json({artist: req.artist});
});

artistRouter.post('/', (req, res, next) => {
    const name = req.body.artist.name;
    const dateOfBirth = req.body.artist.dateOfBirth;
    const biography = req.body.artist.biography;
    const isCurrentlyEmployed = req.body.artist.isCurrentlyEmployed === 0 ? 0 : 1;
    if (!name || !dateOfBirth || !biography) {
        return res.sendStatus(400);
    }
    db.run("INSERT INTO Artist (name, date_of_birth, biography, is_currently_employed) VALUES ($name, $dateOfBirth, $biography, $isCurrentlyEmployed);", {
        $name: name,
        $dateOfBirth: dateOfBirth,
        $biography: biography,
        $isCurrentlyEmployed: isCurrentlyEmployed
    }, function(err) {
        if (err) {
            next(err);
        } else {
            db.get("SELECT * FROM Artist WHERE Artist.id = $id;", {
                $id: this.lastID
            }, (err, artist) => {
                if (err){
                    next(err)
                } else {
                    res.status(201).json({artist: artist});
                };
            });
        };
    });
});

artistRouter.put('/:artistId', (req, res, next) => {
    const name = req.body.artist.name;
    const dateOfBirth = req.body.artist.dateOfBirth;
    const biography = req.body.artist.biography;
    const isCurrentlyEmployed = req.body.artist.isCurrentlyEmployed === 0 ? 0 : 1;
    if (!name || !dateOfBirth || !biography) {
        return res.sendStatus(400);
    }
    db.run("UPDATE Artist SET name = $name, date_of_birth = $dateOfBirth, biography = $biography, is_currently_employed = $isCurrentlyEmployed WHERE Artist.id = $id;", {
        $name: name,
        $dateOfBirth: dateOfBirth,
        $biography: biography,
        $isCurrentlyEmployed: isCurrentlyEmployed,
        $id: req.params.artistId
    }, (err) => {
        if (err) {
            next(err)
        } else {
            db.get(`SELECT * FROM Artist WHERE Artist.id = ${req.params.artistId};`, (err, artist) => {
                res.status(200).json({artist: artist});
            });
        };
    });
});

artistRouter.delete('/:artistId', (req, res, next) => {
    db.run(`UPDATE Artist SET is_currently_employed = 0 WHERE Artist.id = ${req.params.artistId};`, (err) => {
        if (err) {
            next(err);
        } else {
            db.get(`SELECT * FROM Artist WHERE Artist.id = ${req.params.artistId};`, (err, artist) => {
                res.status(200).json({artist: artist});
            });
        }
    });
});

module.exports = artistRouter;