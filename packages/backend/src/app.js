const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { defaultStore, validateTodoInput } = require('./todoStore');

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

function parseTodoId(idValue) {
  const id = Number(idValue);
  if (!Number.isInteger(id) || id < 1) {
    return null;
  }

  return id;
}

app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Backend server is running' });
});

app.get('/api/todos', (req, res) => {
  try {
    res.json(defaultStore.listTodos(req.query));
  } catch (error) {
    console.error('Error fetching todos:', error);
    res.status(500).json({ error: 'Failed to fetch todos' });
  }
});

app.get('/api/todos/:id', (req, res) => {
  try {
    const id = parseTodoId(req.params.id);
    if (!id) {
      return res.status(400).json({ error: 'Valid todo ID is required' });
    }

    const todo = defaultStore.getTodo(id);
    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    res.json(todo);
  } catch (error) {
    console.error('Error fetching todo:', error);
    res.status(500).json({ error: 'Failed to fetch todo' });
  }
});

app.post('/api/todos', (req, res) => {
  try {
    validateTodoInput(req.body);
    const todo = defaultStore.createTodo(req.body);
    res.status(201).json(todo);
  } catch (error) {
    if (error.message.includes('required') || error.message.includes('Valid')) {
      return res.status(400).json({ error: error.message });
    }

    console.error('Error creating todo:', error);
    res.status(500).json({ error: 'Failed to create todo' });
  }
});

  app.put('/api/todos/reorder', (req, res) => {
    try {
      const { ids = [] } = req.body;
      res.json(defaultStore.reorderTodos(ids));
    } catch (error) {
      console.error('Error reordering todos:', error);
      res.status(500).json({ error: 'Failed to reorder todos' });
    }
  });

app.put('/api/todos/:id', (req, res) => {
  try {
    const id = parseTodoId(req.params.id);
    if (!id) {
      return res.status(400).json({ error: 'Valid todo ID is required' });
    }

    const todo = defaultStore.updateTodo(id, req.body);
    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    res.json(todo);
  } catch (error) {
    if (error.message.includes('required') || error.message.includes('Valid')) {
      return res.status(400).json({ error: error.message });
    }

    console.error('Error updating todo:', error);
    res.status(500).json({ error: 'Failed to update todo' });
  }
});

app.patch('/api/todos/:id/toggle', (req, res) => {
  try {
    const id = parseTodoId(req.params.id);
    if (!id) {
      return res.status(400).json({ error: 'Valid todo ID is required' });
    }

    const todo = defaultStore.toggleTodo(id);
    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    res.json(todo);
  } catch (error) {
    console.error('Error toggling todo:', error);
    res.status(500).json({ error: 'Failed to toggle todo' });
  }
});

app.post('/api/todos/:id/duplicate', (req, res) => {
  try {
    const id = parseTodoId(req.params.id);
    if (!id) {
      return res.status(400).json({ error: 'Valid todo ID is required' });
    }

    const todo = defaultStore.duplicateTodo(id);
    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    res.status(201).json(todo);
  } catch (error) {
    console.error('Error duplicating todo:', error);
    res.status(500).json({ error: 'Failed to duplicate todo' });
  }
});

app.patch('/api/todos/bulk-status', (req, res) => {
  try {
    const { ids = [], completed = false } = req.body;
    const updated = defaultStore.bulkSetCompleted(ids, completed);
    res.json({ updated });
  } catch (error) {
    console.error('Error updating todo status:', error);
    res.status(500).json({ error: 'Failed to update todos' });
  }
});

app.delete('/api/todos/completed', (req, res) => {
  try {
    const deletedIds = defaultStore.clearCompleted();
    res.json({ deletedIds });
  } catch (error) {
    console.error('Error clearing completed todos:', error);
    res.status(500).json({ error: 'Failed to clear completed todos' });
  }
});

app.delete('/api/todos/:id', (req, res) => {
  try {
    const id = parseTodoId(req.params.id);
    if (!id) {
      return res.status(400).json({ error: 'Valid todo ID is required' });
    }

    const deleted = defaultStore.deleteTodo(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    res.json({ message: 'Todo deleted successfully', id });
  } catch (error) {
    console.error('Error deleting todo:', error);
    res.status(500).json({ error: 'Failed to delete todo' });
  }
});

module.exports = { app, db: defaultStore.db, store: defaultStore };