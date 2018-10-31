const express = require('express');
const timesheetsRouter = express.Router({
  mergeParams: true
});

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

//Define param for timesheetId
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

// Retrieve all timesheets saved on a certain employee
timesheetsRouter.get('/', (req, res, next) => {
  const sql = `SELECT * FROM Timesheet WHERE employee_id = $employeeId`;
  const values = {
    $employeeId: req.params.employeeId
  };
  db.all(sql, values, (error, timesheets) => {
    if (error) {
      next(error);
    } else {
      res.status(200).json({timesheets: timesheets});
    }
  });
});

//Create new timesheet for an employee
timesheetsRouter.post('/', (req, res, next) => {
  const hours = req.body.timesheet.hours,
    rate = req.body.timesheet.rate,
    date = req.body.timesheet.date;

  if (!hours || !rate || !date) {
    return res.sendStatus(400);
  }

  const sql = `INSERT INTO Timesheet (hours, rate, date, employee_id) VALUES ($hours, $rate, $date, $employeeId)`;
  const values = {
    $hours: hours,
    $rate: rate,
    $date: date,
    $employeeId: req.params.employeeId
  };

  db.run(sql, values, function(error) {
    if (error) {
      next(error)
    } else {
      db.get(`SELECT * FROM Timesheet WHERE Timesheet.id = ${this.lastID}`,
        (error, timesheet) => {
          res.status(201).json({timesheet: timesheet});
        });
     }
  });
});

//Updates a certain timesheet with the id captured from req.params object
timesheetsRouter.put('/:timesheetId', (req, res, next) => {
  //First checking if Employee and other values exist
  const employeeSql = `SELECT * FROM Employee WHERE Employee.id = $employeeId`;
  const employeeValues = {$employeeId: req.params.employeeId};
  db.get(employeeSql, employeeValues, (error, employee) => {
    if(error) {
      next(error);
    } else {
      const hours = req.body.timesheet.hours,
        rate = req.body.timesheet.rate,
        date = req.body.timesheet.date,
        employeeId = req.params.employeeId;

      if (!hours || !rate || !date || !employee) {
        return res.sendStatus(400);
      }
      //Checked that all the values exist, updating the timesheet
      const sql = `UPDATE Timesheet SET hours = $hours, rate = $rate, date = $date, employee_id = $employeeId WHERE Timesheet.id = $timesheetId`;
      const values = {
        $hours: hours,
        $rate: rate,
        $date: date,
        $employeeId: employeeId,
        $timesheetId: req.params.timesheetId
      };

      db.run(sql, values, function(error) {
        if (error) {
          next(error);
        } else {
          db.get(`SELECT * FROM Timesheet WHERE Timesheet.id = ${req.params.timesheetId}`,
          (error, timesheet) => {
            res.status(200).json({timesheet: timesheet});
          });
        }
      });
      }
    });
  });

timesheetsRouter.delete('/:timesheetId', (req, res, next) => {
  const sql = `DELETE FROM Timesheet WHERE Timesheet.id = $timesheetId`;
  const values = {$timesheetId: req.params.timesheetId};
  db.run(sql, values, (error) => {
    if(error) {
      next(error);
    } else {
      res.sendStatus(204);
    }
  });
});


module.exports = timesheetsRouter;
