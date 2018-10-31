const express = require('express');
const menusRouter = express.Router();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

//import menu-items router and link to endpoint for menuId. mergeParams set in menu-items.js
const menuitemsRouter = require('./menuitem.js');
menusRouter.use('/:menuId/menu-items', menuitemsRouter);

//Define param for menuId endpoint
menusRouter.param('menuId', (req, res, next, menuId) => {
  const sql = `SELECT * FROM Menu WHERE Menu.id = $menuId`;
  const values = {
    $menuId: menuId
  };
  db.get(sql, values, (error, menu) => {
    if (error) {
      next(error);
    } else if (menu) {
      req.menu = menu;
      next();
    } else {
      res.sendStatus(404);
    }
  });
});

//Retrieve all menus at /menus endpoint
menusRouter.get('/', (req, res, next) => {
  db.all(`SELECT * FROM Menu`, (error, menus) => {
    if (error) {
      next(error);
    } else {
      res.status(200).json({
        menus: menus
      });
    }
  });
});

//Create a new menu at /menus endpoint
menusRouter.post('/', (req, res, next) => {
  const title = req.body.menu.title;

  if (!title) {
    res.sendStatus(400);
  }

  const sql = `INSERT INTO Menu (title) VALUES ($title)`;
  const values = {
    $title: title
  };
  db.run(sql, values, function (error) {
    if (error) {
      next(error);
    } else {
      db.get(`SELECT * FROM Menu WHERE Menu.id = ${this.lastID}`,
        (error, menu) => {
          if (error) {
            next(error);
          } else {
            res.status(201).json({
              menu: menu
            });
          }
        });
    }
  });
});

// Retrieve a specific menu at the menuID endpoint by using param router we already defined
menusRouter.get('/:menuId', (req, res, next) => {
  res.status(200).json({
    menu: req.menu
  });
});

//Update a specific menu at the menuId endpoint
menusRouter.put('/:menuId', (req, res, next) => {
  const title = req.body.menu.title;
  if (!title) {
    res.sendStatus(400);
  }
  const sql = `UPDATE Menu SET title = $title WHERE Menu.id = $menuId`;
  const values = {
    $title: title,
    $menuId: req.params.menuId
  };
  db.run(sql, values, function (error) {
    if (error) {
      next(error);
    } else {
      db.get(`SELECT * FROM Menu WHERE Menu.id = ${req.params.menuId}`,
        (error, menu) => {
          res.status(200).json({
            menu: menu
          });
        });
    }
  });
});

//Delete a menu at the menuId endpoint
menusRouter.delete('/:menuId', (req, res, next) => {
  //Check whether menuitems exist
  const menuitemsSql = `SELECT * FROM MenuItem WHERE MenuItem.menu_id = $menuId`;
  const menuitemValues = {
    $menuId: req.params.menuId
  };
  db.get(menuitemsSql, menuitemValues, (error, menuitems) => {
    if (error) {
      next(error);
    } else if (menuitems) {
      res.sendStatus(400);
    } else {
      //If not exist we go on to delete the menu with the id captured from req.params object
      const sql = `DELETE FROM Menu WHERE Menu.id = $menuId`;
      const values = {
        $menuId: req.params.menuId
      };
      db.run(sql, values, (error) => {
        if (error) {
          next(error);
        } else {
          res.sendStatus(204);
        }
      });
    }
  });
});


module.exports = menusRouter;
