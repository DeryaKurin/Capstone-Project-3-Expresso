const express = require('express');
const apiRouter = express.Router();

const employeesRouter = require('./employee.js');

apiRouter.use('/employees', employeesRouter);

module.exports = apiRouter;
