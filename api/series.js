const express = require('express');
const seriesRouter = express.Router();
const issuesRouter = require('./issues');
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

seriesRouter.put('/:seriesId', (req, res, next) => {
    const name = req.body.series.name;
    const description = req.body.series.description;
    const sql = "UPDATE Series SET name = $name, description = $description WHERE Series.id = $id";
    const values = {
        $name: name,
        $description: description,
        $id: req.params.seriesId
    };
    if (!name || !description) {
        return res.sendStatus(400);
    }
    db.run(sql, values, function(err) {
        if(err) {
            next(err);
        } else {
            db.get(`SELECT * FROM Series WHERE id = ${req.params.seriesId};`, (err, series) => {
                if(err) {
                    next(err);
                } else {
                    res.status(200).json({series: series});
                }
            });
        }
    });
});

seriesRouter.delete('/:seriesId', (req, res, next) => {
    db.get(`SELECT * FROM Issue WHERE Issue.series_id = ${req.params.seriesId};`, (err, issue) => {
        if(err) {
            next(err);
        } else if (issue) {
            res.sendStatus(400);
        } else {
            db.run(`DELETE FROM Series WHERE Series.id = ${req.params.seriesId};`, function(err) {
                if (err) {
                    next(err);
                } else {
                    res.sendStatus(204);
                };
            });
        };
    });
});

seriesRouter.use('/:seriesId/issues', issuesRouter);

module.exports = seriesRouter;