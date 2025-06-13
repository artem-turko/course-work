const path = require('path');
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// "База даних" в пам’яті
let todos = [];

// Отримати всі завдання
app.get('/api/todos', (req, res) => {
  res.json(todos);
});

// Додати нове завдання
app.post('/api/todos', (req, res) => {
  const { task } = req.body;
  if (!task) {
    return res.status(400).json({ error: 'Task is required' });
  }

  const newTodo = {
    id: todos.length + 1,
    task,
    done: false,
  };

  todos.push(newTodo);
  res.status(201).json(newTodo);
});

app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
  console.log(`ToDo API running at http://localhost:${PORT}`);
});
