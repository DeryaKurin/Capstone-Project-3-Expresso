const express = require('express');
const employeesRouter = express.Router();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

//Define param for employeeId
employeesRouter.param('employeeId', (req, res, next, employeeId) => {
  const sql = `SELECT * FROM Employee WHERE Employee.id = $employeeId`;
  const values = {
    $employeeId: employeeId
  };
  db.get(sql, values, (error, employee) => {
    if (error) {
      next(error);
    } else if (employee) {
      req.employee = employee;
      next();
    } else {
      res.sendStatus(404);
    }
  });
});

// Import Timesheets router and link to endpoint for employeeId.
const timesheetsRouter = require('./timesheet.js');
employeesRouter.use('/:employeeId/timesheets', timesheetsRouter);

// Retrieves all currently employed employees
employeesRouter.get('/', (req, res, next) => {
  db.all(`SELECT * FROM Employee WHERE Employee.is_current_employee = 1`,
    (error, employees) => {
      if (error) {
        next(error);
      } else {
        res.status(200).json({
          employees: employees
        });
      }
    });
});

// Create an employee at the employees endpoint
employeesRouter.post('/', (req, res, next) => {
  const name = req.body.employee.name;
  const position = req.body.employee.position;
  const wage = req.body.employee.wage;

  if (!name || !position || !wage) {
    return res.sendStatus(400);
  }
  // Set new Employee as currently employed by default, so equals to 1
  const isCurrentEmployee = 1;

  const values = {
    $name: req.body.employee.name,
    $position: req.body.employee.position,
    $wage: req.body.employee.wage,
    $isCurrentEmployee: isCurrentEmployee
  };
  const sql = 'INSERT INTO Employee (name, position, wage, is_current_employee) VALUES ($name, $position, $wage, $isCurrentEmployee)';
  db.run(sql, values, function (error) {
    if (error) {
      next(error);
    } else {
      db.get(`SELECT * FROM Employee WHERE Employee.id = ${this.lastID}`,
        (error, employee) => {
          res.status(201).json({
            employee: employee
          });
        });
    }
  });
});

// Retrieve an employee with the employeeId endpoint
employeesRouter.get('/:employeeId', (req, res, next) => {
  res.status(200).json({
    employee: req.employee
  });
});

//Updates an employee
employeesRouter.put('/:employeeId', (req, res, next) => {
  const name = req.body.employee.name;
  const position = req.body.employee.position;
  const wage = req.body.employee.wage;

  if (!name || !position || !wage) {
    return res.sendStatus(400);
  }
  // We set isCurrentEmployee to the value captured from req.params object. It is either 1 or 0.
  const isCurrentEmployee = req.params.isCurrentEmployee === 1 ? 1 : 0;
  const sql = `UPDATE Employee SET name = $name, position = $position, wage = $wage, is_current_employee = $isCurrentEmployee WHERE Employee.id = $employeeId`;
  const values = {
    $name: name,
    $position: position,
    $wage: wage,
    $isCurrentEmployee: isCurrentEmployee,
    $employeeId: req.params.employeeId
  };

  db.run(sql, values, (error) => {
    if (error) {
      next(error);
    } else {
      db.get(`SELECT * FROM Employee WHERE Employee.id = ${req.params.employeeId}`,
        (error, employee) => {
          res.status(200).json({
            employee: employee
          });
        });
    }
  });
});

//Delete Employee by updating is_current_employee to 0
employeesRouter.delete('/:employeeId', (req, res, next) => {
  const sql = `UPDATE Employee SET is_current_employee = 0 WHERE Employee.id = $employeeId`;
  const values = {
    $employeeId: req.params.employeeId
  };

  db.run(sql, values, (error) => {
    if (error) {
      next(error);
    } else {
      db.get(`SELECT * FROM Employee WHERE Employee.id = ${req.params.employeeId}`,
        (error, employee) => {
          res.status(200).json({
            employee: employee
          });
        });
    }
  });
});


module.exports = employeesRouter;
