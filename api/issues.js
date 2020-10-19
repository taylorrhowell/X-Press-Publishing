const express = require('express');
const issuesRouter = express.Router({mergeParams: true});
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

issuesRouter.get('/', (req, res, next) => {
    const sql = "SELECT * FROM Issue WHERE Issue.series_id = $id;";
    const values = {
        $id: req.params.seriesId
    }; 
    db.all(sql, values, (err, issues) => {
        if (err) {
            next(err);
        } else {
            res.status(200).json({issues: issues});
        }
    });
});

issuesRouter.post('/', (req, res, next) => {
    const name = req.body.issue.name, issueNumber = req.body.issue.issueNumber, publicationDate = req.body.issue.publicationDate, artistId = req.body.issue.artistId;
    if (!name || !issueNumber || !publicationDate || !artistId) {
        return res.sendStatus(400);
    };
    const artistExists = db.get("SELECT * FROM Artist WHERE id = $artistId;", {artistId: artistId}, (err, artist) => {
        if (err) {
            return false;
        } else {
            return true;
        };
    });
    if (!artistExists) {
        return res.sendStatus(400);
    } else {
        db.run("INSERT INTO Issue (name, issue_number, publication_date, artist_id, series_id) VALUES ($name, $issueNumber, $publicationDate, $artistId, $seriesId)", {
            $name: name,
            $issueNumber: issueNumber,
            $publicationDate: publicationDate,
            $artistId: artistId,
            $seriesId: req.params.seriesId
        }, function(err) {
            if (err) {
                next(err);
            } else {
                db.get(`SELECT * FROM Issue WHERE Issue.id = ${this.lastID};`, (err, issue) => {
                    if (err) {
                        next(err);
                    } else {
                        res.status(201).json({issue: issue});
                    };
                });
            };
        });
    };
});

module.exports = issuesRouter;