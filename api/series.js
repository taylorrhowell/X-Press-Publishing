const express = require('express');
const seriesRouter = express.Router();
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

seriesRouter.param('seriesId', (req, res, next, seriesId) => {
    db.get(`SELECT * FROM Series WHERE id = ${seriesId};`, (err, series) => {
        if (err) {
            next(err);
        } else if (series){
            req.series = series;
            next();
        } else {
            res.sendStatus(404);
        }
    })
});

seriesRouter.get('/', (req, res, next) => {
    db.all("SELECT * FROM Series", (err, series) => {
        if (err) {
            next(err);
        } else {
            res.status(200).json({series: series});
        }
    });
});

seriesRouter.get('/:seriesId', (req, res, next) => {
    res.status(200).json({series: req.series});
});

seriesRouter.post('/', (req, res, next) => {
    const name = req.body.series.name;
    const description = req.body.series.description;
    const values = {$name: name, $description: description};
    if (!name || !description) {
        return res.sendStatus(400);
    }
    db.run(`INSERT INTO Series (name, description) VALUES ($name, $description);`, values, function(err) {
        if (err) {
            next(err);
        } else {
            db.get(`SELECT * FROM Series WHERE id = ${this.lastID};`, (err, series) => {
                if (err) {
                    next(err);
                } else {
                    res.status(201).json({series: series});
                }
            });
        }
    });
});

module.exports = seriesRouter;