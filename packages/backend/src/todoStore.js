const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const VALID_PRIORITIES = ['low', 'medium', 'high'];
const DEFAULT_DB_PATH = process.env.TODO_DB_PATH || path.join(__dirname, '..', 'data', 'todos.db');

function ensureDirectory(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function sanitizeTags(tags) {
  if (Array.isArray(tags)) {
    return tags.map((tag) => String(tag).trim()).filter(Boolean);
  }

  if (typeof tags === 'string') {
    return tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);
  }

  return [];
}

function isValidDate(value) {
  if (value === null || value === undefined || value === '') {
    return true;
  }

  const parsed = new Date(value);
  return !Number.isNaN(parsed.getTime());
}

function normalizeTodo(row) {
  if (!row) {
    return row;
  }

  return {
    id: row.id,
    title: row.title,
    description: row.description,
    completed: Boolean(row.completed),
    dueDate: row.due_date,
    priority: row.priority,
    tags: JSON.parse(row.tags || '[]'),
    orderIndex: row.order_index,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function validateTodoInput(input) {
  const { title, priority = 'medium', dueDate = null } = input;

  if (!title || typeof title !== 'string' || title.trim() === '') {
    throw new Error('Todo title is required');
  }

  if (!VALID_PRIORITIES.includes(priority)) {
    throw new Error('Valid priority is required');
  }

  if (!isValidDate(dueDate)) {
    throw new Error('Valid due date is required');
  }
}

function sortTodos(todos, sortBy = 'orderIndex', sortOrder = 'asc') {
  const direction = sortOrder === 'desc' ? -1 : 1;

  return [...todos].sort((left, right) => {
    const leftValue = left[sortBy];
    const rightValue = right[sortBy];

    if (leftValue === rightValue) {
      return left.orderIndex - right.orderIndex;
    }

    if (leftValue === null || leftValue === undefined) {
      return -1 * direction;
    }

    if (rightValue === null || rightValue === undefined) {
      return 1 * direction;
    }

    if (sortBy === 'dueDate' || sortBy === 'createdAt' || sortBy === 'updatedAt') {
      return (new Date(leftValue).getTime() - new Date(rightValue).getTime()) * direction;
    }

    if (typeof leftValue === 'number' && typeof rightValue === 'number') {
      return (leftValue - rightValue) * direction;
    }

    return String(leftValue).localeCompare(String(rightValue)) * direction;
  });
}

function createTodoStore(dbPath = DEFAULT_DB_PATH) {
  ensureDirectory(dbPath);

  const db = new Database(dbPath);

  db.exec(`
    CREATE TABLE IF NOT EXISTS todos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      completed INTEGER NOT NULL DEFAULT 0,
      due_date TEXT DEFAULT NULL,
      priority TEXT NOT NULL DEFAULT 'medium',
      tags TEXT NOT NULL DEFAULT '[]',
      order_index INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const count = db.prepare('SELECT COUNT(*) AS count FROM todos').get().count;
  if (count === 0) {
    const seed = db.prepare(`
      INSERT INTO todos (
        title,
        description,
        completed,
        due_date,
        priority,
        tags,
        order_index,
        created_at,
        updated_at
      ) VALUES (
        @title,
        @description,
        @completed,
        @due_date,
        @priority,
        @tags,
        @order_index,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
      )
    `);

    [
      'Plan weekly tasks',
      'Finish bootcamp TODO UI',
      'Add due date support',
    ].forEach((title, orderIndex) => {
      seed.run({
        title,
        description: '',
        completed: 0,
        due_date: null,
        priority: 'medium',
        tags: JSON.stringify([]),
        order_index: orderIndex,
      });
    });
  }

  const selectById = db.prepare('SELECT * FROM todos WHERE id = ?');
  const insertStmt = db.prepare(`
    INSERT INTO todos (
      title,
      description,
      completed,
      due_date,
      priority,
      tags,
      order_index,
      created_at,
      updated_at
    ) VALUES (
      @title,
      @description,
      @completed,
      @due_date,
      @priority,
      @tags,
      @order_index,
      CURRENT_TIMESTAMP,
      CURRENT_TIMESTAMP
    )
  `);

  function listTodos(filters = {}) {
    const { search, status, priority, tag, dueFrom, dueTo, sortBy = 'orderIndex', sortOrder = 'asc' } = filters;

    let todos = db.prepare('SELECT * FROM todos').all().map(normalizeTodo);

    if (search) {
      const searchTerm = String(search).toLowerCase();
      todos = todos.filter((todo) => `${todo.title} ${todo.description}`.toLowerCase().includes(searchTerm));
    }

    if (status === 'active') {
      todos = todos.filter((todo) => !todo.completed);
    }

    if (status === 'completed') {
      todos = todos.filter((todo) => todo.completed);
    }

    if (priority && VALID_PRIORITIES.includes(priority)) {
      todos = todos.filter((todo) => todo.priority === priority);
    }

    if (tag) {
      todos = todos.filter((todo) => todo.tags.includes(tag));
    }

    if (dueFrom) {
      todos = todos.filter((todo) => todo.dueDate && todo.dueDate >= dueFrom);
    }

    if (dueTo) {
      todos = todos.filter((todo) => todo.dueDate && todo.dueDate <= dueTo);
    }

    const sortKeyMap = {
      orderIndex: 'orderIndex',
      createdAt: 'createdAt',
      dueDate: 'dueDate',
      title: 'title',
      priority: 'priority',
    };

    const resolvedSortBy = sortKeyMap[sortBy] || 'orderIndex';
    return sortTodos(todos, resolvedSortBy, sortOrder);
  }

  function getTodo(id) {
    return normalizeTodo(selectById.get(id));
  }

  function createTodo(input) {
    validateTodoInput(input);
    const result = insertStmt.run({
      title: input.title.trim(),
      description: typeof input.description === 'string' ? input.description.trim() : '',
      completed: 0,
      due_date: input.dueDate || null,
      priority: input.priority || 'medium',
      tags: JSON.stringify(sanitizeTags(input.tags)),
      order_index: db.prepare('SELECT COALESCE(MAX(order_index), -1) + 1 AS nextIndex FROM todos').get().nextIndex,
    });

    return getTodo(result.lastInsertRowid);
  }

  function updateTodo(id, input) {
    const todo = getTodo(id);
    if (!todo) {
      return null;
    }

    const next = {
      title: input.title !== undefined ? input.title : todo.title,
      description: input.description !== undefined ? input.description : todo.description,
      dueDate: input.dueDate !== undefined ? input.dueDate : todo.dueDate,
      priority: input.priority !== undefined ? input.priority : todo.priority,
    };

    validateTodoInput(next);

    db.prepare(`
      UPDATE todos
      SET title = ?, description = ?, due_date = ?, priority = ?, tags = ?, completed = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      String(next.title).trim(),
      typeof next.description === 'string' ? next.description.trim() : '',
      next.dueDate || null,
      next.priority,
      JSON.stringify(sanitizeTags(input.tags !== undefined ? input.tags : todo.tags)),
      input.completed !== undefined ? (input.completed ? 1 : 0) : todo.completed ? 1 : 0,
      id
    );

    return getTodo(id);
  }

  function deleteTodo(id) {
    const existing = getTodo(id);
    if (!existing) {
      return null;
    }

    db.prepare('DELETE FROM todos WHERE id = ?').run(id);
    return existing;
  }

  function toggleTodo(id) {
    const todo = getTodo(id);
    if (!todo) {
      return null;
    }

    db.prepare('UPDATE todos SET completed = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(todo.completed ? 0 : 1, id);
    return getTodo(id);
  }

  function bulkSetCompleted(ids, completed) {
    const resolvedIds = Array.isArray(ids) ? ids.map((value) => Number(value)).filter(Number.isInteger) : [];
    if (resolvedIds.length === 0) {
      return [];
    }

    const stmt = db.prepare('UPDATE todos SET completed = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
    const transaction = db.transaction((todoIds) => {
      todoIds.forEach((todoId) => {
        stmt.run(completed ? 1 : 0, todoId);
      });
    });

    transaction(resolvedIds);
    return resolvedIds.map((todoId) => getTodo(todoId)).filter(Boolean);
  }

  function clearCompleted() {
    const completedIds = db.prepare('SELECT id FROM todos WHERE completed = 1').all().map((row) => row.id);
    db.prepare('DELETE FROM todos WHERE completed = 1').run();
    return completedIds;
  }

  function duplicateTodo(id) {
    const todo = getTodo(id);
    if (!todo) {
      return null;
    }

    return createTodo({
      title: `${todo.title} (copy)`,
      description: todo.description,
      dueDate: todo.dueDate,
      priority: todo.priority,
      tags: todo.tags,
    });
  }

  function reorderTodos(ids) {
    const resolvedIds = Array.isArray(ids) ? ids.map((value) => Number(value)).filter(Number.isInteger) : [];
    if (resolvedIds.length === 0) {
      return listTodos();
    }

    const stmt = db.prepare('UPDATE todos SET order_index = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
    const transaction = db.transaction((todoIds) => {
      todoIds.forEach((todoId, index) => {
        stmt.run(index, todoId);
      });
    });

    transaction(resolvedIds);
    return listTodos();
  }

  return {
    db,
    getTodo,
    listTodos,
    createTodo,
    updateTodo,
    deleteTodo,
    toggleTodo,
    bulkSetCompleted,
    clearCompleted,
    duplicateTodo,
    reorderTodos,
  };
}

const defaultStore = createTodoStore();

module.exports = {
  VALID_PRIORITIES,
  createTodoStore,
  defaultStore,
  normalizeTodo,
  sanitizeTags,
  validateTodoInput,
};