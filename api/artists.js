const express = require('express');
const artistRouter = express.Router();
const sqlite3 = require('sqlite3');
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

module.exports = artistRouter;