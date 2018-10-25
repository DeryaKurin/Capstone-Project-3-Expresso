const express = require('express');
const apiRouter = express.Router();

const employeesRouter = require('./employee.js');
// const timesheetsRouter = require('./timesheet.js');
// const menuitemsRouter = require('./menuitem.js');
// const timesheetsRouter = require('./timesheet.js');


apiRouter.use('/employees', employeesRouter);
// apiRouter.use('/timesheets', timesheetsRouter);
// apiRouter.use('/employees', employeesRouter);
// apiRouter.use('/employees', employeesRouter);

module.exports = apiRouter;
