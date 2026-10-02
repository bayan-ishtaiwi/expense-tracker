const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT
});

// GET all expenses
app.get("/api/expenses", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        title,
        amount::float8 AS amount,
        category,
        to_char(date, 'YYYY-MM-DD') AS date
      FROM expenses
      ORDER BY id
    `);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET one expense
app.get("/api/expenses/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(404).json({ message: "Expense not found" });
  }

  try {
    const result = await pool.query(
      `
      SELECT
        id,
        title,
        amount::float8 AS amount,
        category,
        to_char(date, 'YYYY-MM-DD') AS date
      FROM expenses
      WHERE id = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Expense not found" });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// POST new expense
app.post("/api/expenses", async (req, res) => {
  const { title, amount, category, date } = req.body;

  const allowedCategories = [
    "Food",
    "Transport",
    "Bills",
    "Entertainment",
    "Other"
  ];

  if (!title || typeof title !== "string" || title.trim() === "") {
    return res.status(400).json({ message: "Title is required" });
  }

  if (typeof amount !== "number" || amount <= 0) {
    return res.status(400).json({
      message: "Amount must be a number greater than 0"
    });
  }

  if (!allowedCategories.includes(category)) {
    return res.status(400).json({
      message: "Invalid category"
    });
  }

  if (!date) {
    return res.status(400).json({
      message: "Date is required"
    });
  }

  try {
    const result = await pool.query(
      `
      INSERT INTO expenses (title, amount, category, date)
      VALUES ($1, $2, $3, $4)
      RETURNING
        id,
        title,
        amount::float8 AS amount,
        category,
        to_char(date, 'YYYY-MM-DD') AS date
      `,
      [title.trim(), amount, category, date]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Invalid expense data" });
  }
});

// PUT update expense
app.put("/api/expenses/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(404).json({ message: "Expense not found" });
  }

  const { title, amount, category, date } = req.body;

  const allowedCategories = [
    "Food",
    "Transport",
    "Bills",
    "Entertainment",
    "Other"
  ];

  if (!title || typeof title !== "string" || title.trim() === "") {
    return res.status(400).json({ message: "Title is required" });
  }

  if (typeof amount !== "number" || amount <= 0) {
    return res.status(400).json({
      message: "Amount must be a number greater than 0"
    });
  }

  if (!allowedCategories.includes(category)) {
    return res.status(400).json({
      message: "Invalid category"
    });
  }

  if (!date) {
    return res.status(400).json({
      message: "Date is required"
    });
  }

  try {
    const result = await pool.query(
      `
      UPDATE expenses
      SET title = $1,
          amount = $2,
          category = $3,
          date = $4
      WHERE id = $5
      RETURNING
        id,
        title,
        amount::float8 AS amount,
        category,
        to_char(date, 'YYYY-MM-DD') AS date
      `,
      [title.trim(), amount, category, date, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Expense not found" });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Invalid expense data" });
  }
});

// DELETE expense
app.delete("/api/expenses/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(404).json({ message: "Expense not found" });
  }

  try {
    const result = await pool.query(
      `
      DELETE FROM expenses
      WHERE id = $1
      RETURNING
        id,
        title,
        amount::float8 AS amount,
        category,
        to_char(date, 'YYYY-MM-DD') AS date
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Expense not found" });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});