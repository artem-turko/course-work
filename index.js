const express = require('express');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

// Створюємо пул зчитуючи з env (PGHOST, PGUSER, PGPASSWORD, PGDATABASE, PGPORT)
const pool = new Pool();

app.use(express.json());

// Обробка неперехоплених помилок
process.on('unhandledRejection', err => {
  console.error('💥 Unhandled rejection:', err.message);
  process.exit(1);
});

(async () => {
  try {
    // Підключення до БД та створення таблиці
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS todos (
        id SERIAL PRIMARY KEY,
        task TEXT NOT NULL,
        done BOOLEAN DEFAULT false
      );
    `;
    await pool.query(createTableQuery);
    console.log('✅ PostgreSQL connected, table ready');

    // Старт сервера
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });

  } catch (err) {
    console.error('❌ Failed to connect to DB or start server:', err.message);
    process.exit(1);
  }
})();

// API: Отримати всі задачі
app.get('/api/todos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM todos ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

// API: Додати задачу
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
