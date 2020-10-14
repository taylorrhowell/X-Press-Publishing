const express = require('express');
const seriesRouter = express.Router();
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

seriesRouter.param('seriesId', (req, res, next, seriesId) => {
    db.get(`SELECT * FROM Series WHERE id = ${seriesId};`, (err, series) => {
        if (err) {
            res.sendStatus(404);
        } else {
            req.series = series;
            next();
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

module.exports = seriesRouter;