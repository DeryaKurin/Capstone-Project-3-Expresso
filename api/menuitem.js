const express = require('express');
const menuitemsRouter = express.Router({
  mergeParams: true
});

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

menuitemsRouter.param('menuItemId', (req, res, next, menuItemId) => {
  const sql = `SELECT * FROM MenuItem WHERE MenuItem.id = $menuItemId`;
  const values = {
    $menuItemId: menuItemId
  };
  db.get(sql, values, (error, menuitem) => {
    if (error) {
      next(error);
    } else if (menuitem) {
      req.menuItem = menuitem;
      next();
    } else {
      res.sendStatus(404);
    }
  });
});

//Retrieve all menu-items saved to a certain menu
menuitemsRouter.get('/', (req, res, next) => {
  const sql = `SELECT * FROM MenuItem WHERE MenuItem.menu_id = $menuId`;
  const values = {
    $menuId: req.params.menuId
  };
  db.all(sql, values, (error, menuitems) => {
    if (error) {
      next(error);
    } else {
      res.status(200).json({
        menuItems: menuitems
      });
    }
  });
});

//Creates new menu-item for a certain menu
menuitemsRouter.post('/', (req, res, next) => {
  //First check if all menu items exist
  const menuSql = `SELECT * FROM Menu WHERE Menu.id = $menuId`;
  const menuValues = {
    $menuId: req.params.menuId
  };
  db.get(menuSql, menuValues, (error, menu) => {
    if (error) {
      next(error);
    } else {
      const name = req.body.menuItem.name,
        description = req.body.menuItem.description,
        inventory = req.body.menuItem.inventory,
        price = req.body.menuItem.price;
      if (!name || !description || !inventory || !price || !menu) {
        res.sendStatus(400);
      }
      //All values exist so we go on to create a new menuItem
      const sql = `INSERT INTO MenuItem (name, description, inventory, price, menu_id) VALUES ($name, $description, $inventory, $price, $menuId)`;
      const values = {
        $name: req.body.menuItem.name,
        $description: req.body.menuItem.description,
        $inventory: req.body.menuItem.inventory,
        $price: req.body.menuItem.price,
        $menuId: req.params.menuId
      };
      db.run(sql, values, function (error) {
        if (error) {
          next(error);
        } else {
          db.get(`SELECT * FROM MenuItem WHERE MenuItem.id = ${this.lastID}`,
            (error, menuitem) => {
              res.status(201).json({
                menuItem: menuitem
              });
            });
        }
      });
    }
  });
});

//Update an existing menuItem at the menuItemId endpoint
menuitemsRouter.put('/:menuItemId', (req, res, next) => {
  //First check if Menu exists
  const menuSql = `SELECT * FROM Menu WHERE Menu.id = $menuId`;
  const menuValues = {
    $menuId: req.params.menuId
  };
  db.get(menuSql, menuValues, (error, menu) => {
    if (error) {
      next(error);
    } else {
      const name = req.body.menuItem.name,
        description = req.body.menuItem.description,
        inventory = req.body.menuItem.inventory,
        price = req.body.menuItem.price,
        menuId = req.params.menuId;

      if (!name || !description || !inventory || !price || !menu) {
        res.sendStatus(400);
      }
      // Menu and other values exist so we go on to update MenuItem
      const sql = `UPDATE MenuItem SET name = $name, description = $description, inventory = $inventory, price = $price, menu_id = $menuId WHERE MenuItem.id = $menuItemId`;
      const values = {
        $name: name,
        $description: description,
        $inventory: inventory,
        $price: price,
        $menuId: menuId,
        $menuItemId: req.params.menuItemId
      };

      db.run(sql, values, function (error) {
        if (error) {
          next(error);
        } else {
          db.get(`SELECT * FROM MenuItem WHERE MenuItem.id = ${req.params.menuItemId}`,
            (error, menuitem) => {
              res.status(200).json({
                menuItem: menuitem
              });
            });
        }
      });
    }
  });
});

//Delete a MenuItem at the menuItemId endpoint
menuitemsRouter.delete('/:menuItemId', (req, res, next) => {
  const sql = `DELETE FROM MenuItem WHERE MenuItem.id = $menuItemId`;
  const values = {
    $menuItemId: req.params.menuItemId
  };
  db.run(sql, values, (error) => {
    if (error) {
      next(error);
    } else {
      res.sendStatus(204);
    }
  });
});

module.exports = menuitemsRouter;
