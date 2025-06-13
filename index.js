const express = require('express');
const path = require('path');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

// Статичні файли (HTML/CSS/JS)
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Підключення до PostgreSQL
const pool = new Pool({
  host: process.env.PGHOST,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  port: process.env.PGPORT
});

// Обробка неперехоплених помилок
process.on('unhandledRejection', err => {
  console.error('💥 Unhandled rejection:', err.message);
  process.exit(1);
});

// Ініціалізація: створення таблиці, запуск сервера
(async () => {
  try {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS todos (
        id SERIAL PRIMARY KEY,
        task TEXT NOT NULL,
        done BOOLEAN DEFAULT false
      );
    `;
    await pool.query(createTableQuery);
    console.log('✅ PostgreSQL connected, table ready');

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Failed to connect to DB or start server:', err.message);
    process.exit(1);
  }
})();

// ===== API =====

// Отримати всі задачі
app.get('/api/todos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM todos ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Додати нову задачу
app.post('/api/todos', async (req, res) => {
  const { task } = req.body;
  if (!task) return res.status(400).json({ error: 'Task is required' });

  try {
    const result = await pool.query(
      'INSERT INTO todos (task) VALUES ($1) RETURNING *',
      [task]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add task' });
  }
});

// Оновити статус (done)
app.patch('/api/todos/:id', async (req, res) => {
  const { id } = req.params;
  const { done } = req.body;
  try {
    await pool.query(
      'UPDATE todos SET done = $1 WHERE id = $2',
      [done, id]
    );
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// Видалити задачу
app.delete('/api/todos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM todos WHERE id = $1', [id]);
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete task' });
  }
});
