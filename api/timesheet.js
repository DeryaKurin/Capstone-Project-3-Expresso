const express = require('express');
const timesheetsRouter = express.Router({mergeParams: true});

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');


timesheetsRouter.param('timesheetId', (req, res, next, timesheetId) => {
  const sql = `SELECT * FROM Timesheet WHERE Timesheet.id = $timesheetId`;
  const values = {$timesheetId: timesheetId};
  db.get(sql, values, (error, timesheet) => {
    if (error) {
      next(error);
    } else if (timesheet) {
      next();
    } else {
      res.sendStatus(404);
    }
  });
});

timesheetsRouter.get('/', (req, res, next) => {
  const sql = `SELECT * FROM Timesheet WHERE employeeId = $employeeId`;
  const values = {$employeeId: req.params.employeeId};
  db.get(sql, values, (error, timesheets) => {
    if (error) {
      next(error);
    } else if (timesheets) {
      res.status(200).json({timesheets: timesheets});
    }
  });
});


module.exports = timesheetsRouter;
