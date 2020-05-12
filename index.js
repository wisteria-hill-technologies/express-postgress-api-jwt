const express = require("express");
const app = express();
require('dotenv').config();
const pool = require("./db");
const cors = require("cors");
const signup = require('./controllers/authentication').signup;
const signin = require('./controllers/authentication').signin;
const checkBody = require('./controllers/authentication').checkBody;
const JWTAuth = require('./controllers/authentication').JWTAuth;

app.use(cors());
app.use(express.json()); //req.body

// ROUTES //
app.post('/signup', checkBody, signup);
app.post('/signin', checkBody, signin);

app.post("/categories", JWTAuth, async (req, res) => {
  try {
    const { label, parent_cat_id } = req.body;
    const newCategory = await pool.query(
      "insert into categories (label, parent_cat_id) values ($1, $2) returning *",
      [label, parent_cat_id]
    );
    res.json(newCategory.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.json({ "error": err.message });
  }
});

app.get("/categories/toplevel", JWTAuth, async (req, res) => {
  try {
    // get only toplevel categories without parent categories
    const allCategories = await pool.query("SELECT * FROM categories where parent_cat_id isnull");
    res.json(allCategories.rows);
  } catch (err) {
    console.error(err.message);
    res.json({ "error": err.message });
  }
});

app.get("/categories", JWTAuth, async (req, res) => {
  try {
    const { parent_cat_id } = req.query;
    let allCategories = [];
    if (parent_cat_id) {
      allCategories = await pool.query("SELECT * FROM categories where parent_cat_id = $1", [parent_cat_id]);
    } else {
      allCategories = await pool.query("SELECT * FROM categories");
    }
    res.json(allCategories.rows);
  } catch (err) {
    console.error(err.message);
    res.json({ "error": err.message });
  }
});

app.get("/categories/:id", JWTAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const selectedCategory = await pool.query("SELECT * FROM categories where cat_id = $1", [ id ]);
    res.json(selectedCategory.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.json({ "error": err.message });
  }
});

app.put("/categories", JWTAuth, async (req, res) => {
  try {
    const { id, label, parent_cat_id } = req.body;
    let updatedCategory = null;
    if (parent_cat_id) {
      updatedCategory = await pool.query(
        "update categories set label = COALESCE($1, label), parent_cat_id = $2 where cat_id = $3 returning *",
        [label, parent_cat_id, id]
      );
    } else {
      const isUndefined = parent_cat_id !== null;
      const queryStr = isUndefined
      ? "update categories set label = COALESCE($1, label) where cat_id = $2 returning *"
        : "update categories set label = COALESCE($1, label), parent_cat_id = null where cat_id = $2 returning *";
      updatedCategory = await pool.query(
        queryStr,
        [label, id]
      );
    }


    res.json(updatedCategory.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.json({ "error": err.message });
  }
});

app.delete("/categories", JWTAuth, async (req, res) => {
  try {
    const { id } = req.body;
    const deleteCategory = await pool.query("delete from categories where cat_id = $1 returning *", [
      id
    ]);
    res.json(deleteCategory.rows[0]);
  } catch (err) {
    console.log(err.message);
    res.json({ "error": err.message });
  }
});

app.post("/items", JWTAuth, async (req, res) => {
  try {
    const { label, cat_id } = req.body;
    const newItem = await pool.query(
      "insert into items (label, cat_id) values ($1, $2) RETURNING *",
      [label, cat_id]
    );
    res.json(newItem.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.json({ "error": err.message });
  }
});

app.get("/items", JWTAuth, async (req, res) => {
  try {
    const { cat_id } = req.query;
    let allItems = [];
    if (cat_id) {
      allItems = await pool.query("SELECT * FROM items where cat_id = $1", [cat_id]);
    } else {
      allItems = await pool.query("SELECT * FROM items");
    }
    res.json(allItems.rows);
  } catch (err) {
    console.error(err.message);
    res.json({ "error": err.message });
  }
});

app.get("/items/:id", JWTAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const selectedItem = await pool.query("SELECT * FROM items where item_id = $1", [ id ]);
    res.json(selectedItem.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.json({ "error": err.message });
  }
});

app.put("/items", JWTAuth, async (req, res) => {
  try {
    const { id, label, cat_id } = req.body;
    const updatedItem = await pool.query(
      "update items set label = COALESCE($1, label), cat_id =COALESCE($2, cat_id) where item_id = $3 returning *",
      [label, cat_id, id]
    );

    res.json(updatedItem.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.json({ "error": err.message });
  }
});

app.delete("/items", JWTAuth, async (req, res) => {
  try {
    const { id } = req.body;
    const deletedItem = await pool.query("delete from items where item_id = $1 returning *", [
      id
    ]);
    res.json(deletedItem.rows[0]);
  } catch (err) {
    console.log(err.message);
    res.json({ "error": err.message });
  }
});

app.get("/users", JWTAuth, async (req, res) => {
  try {
    const allUsers = await pool.query("SELECT * FROM users");
    res.json(allUsers.rows);
  } catch (err) {
    console.error(err.message);
    res.json({ "error": err.message });
  }
});

app.listen(5000, () => {
  console.log("server has started on port 5000");
});


