import React, { useEffect, useState } from 'react';
import './App.css';

const emptyForm = {
  title: '',
  description: '',
  dueDate: '',
  priority: 'medium',
  tags: '',
};

const emptyFilters = {
  search: '',
  status: 'all',
  priority: 'all',
  tag: '',
  sortBy: 'orderIndex',
  sortOrder: 'asc',
};

const apiBaseUrl =
  process.env.REACT_APP_API_BASE_URL || '';

function apiUrl(path) {
  return `${apiBaseUrl}${path}`;
}

function parseTags(value) {
  return value
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function formatDueState(todo) {
  if (!todo.dueDate) {
    return null;
  }

  const today = new Date();
  const todayKey = today.toISOString().slice(0, 10);
  const dueKey = new Date(todo.dueDate).toISOString().slice(0, 10);

  if (todo.completed) {
    return 'Completed';
  }

  if (dueKey < todayKey) {
    return 'Overdue';
  }

  if (dueKey === todayKey) {
    return 'Due today';
  }

  return `Due ${dueKey}`;
}

function App() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [filters, setFilters] = useState(emptyFilters);
  const [editingId, setEditingId] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);

  const loadTodos = async (activeFilters = filters) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (activeFilters.search) params.set('search', activeFilters.search);
      if (activeFilters.status !== 'all') params.set('status', activeFilters.status);
      if (activeFilters.priority !== 'all') params.set('priority', activeFilters.priority);
      if (activeFilters.tag) params.set('tag', activeFilters.tag);
      if (activeFilters.sortBy) params.set('sortBy', activeFilters.sortBy);
      if (activeFilters.sortOrder) params.set('sortOrder', activeFilters.sortOrder);

      const response = await fetch(apiUrl(`/api/todos?${params.toString()}`));
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const result = await response.json();
      setTodos(result);
      setError('');
      setSelectedIds((currentSelected) => currentSelected.filter((id) => result.some((todo) => todo.id === id)));
    } catch (fetchError) {
      setError(`Failed to fetch todos: ${fetchError.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTodos(filters);
  }, [filters.search, filters.status, filters.priority, filters.tag, filters.sortBy, filters.sortOrder]);

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleFormChange = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.title.trim()) {
      setError('Todo title is required');
      return;
    }

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      dueDate: form.dueDate || null,
      priority: form.priority,
      tags: parseTags(form.tags),
    };

    const url = editingId ? `/api/todos/${editingId}` : '/api/todos';
    const method = editingId ? 'PUT' : 'POST';

    try {
      const response = await fetch(apiUrl(url), {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || 'Failed to save todo');
      }

      const savedTodo = await response.json();

      setTodos((currentTodos) => {
        if (editingId) {
          return currentTodos.map((todo) => (todo.id === editingId ? savedTodo : todo));
        }

        return [...currentTodos, savedTodo];
      });

      resetForm();
    } catch (saveError) {
      setError(`Error saving todo: ${saveError.message}`);
    }
  };

  const startEdit = (todo) => {
    setEditingId(todo.id);
    setForm({
      title: todo.title,
      description: todo.description || '',
      dueDate: todo.dueDate || '',
      priority: todo.priority || 'medium',
      tags: Array.isArray(todo.tags) ? todo.tags.join(', ') : '',
    });
  };

  const toggleSelected = (todoId) => {
    setSelectedIds((current) => (
      current.includes(todoId)
        ? current.filter((id) => id !== todoId)
        : [...current, todoId]
    ));
  };

  const handleToggle = async (todoId) => {
    try {
      const response = await fetch(apiUrl(`/api/todos/${todoId}/toggle`), { method: 'PATCH' });
      if (!response.ok) {
        throw new Error('Failed to toggle todo');
      }

      const updatedTodo = await response.json();
      setTodos((currentTodos) => currentTodos.map((todo) => (todo.id === todoId ? updatedTodo : todo)));
    } catch (toggleError) {
      setError(`Error updating todo: ${toggleError.message}`);
    }
  };

  const handleDuplicate = async (todoId) => {
    try {
      const response = await fetch(apiUrl(`/api/todos/${todoId}/duplicate`), { method: 'POST' });
      if (!response.ok) {
        throw new Error('Failed to duplicate todo');
      }

      const duplicatedTodo = await response.json();
      setTodos((currentTodos) => [...currentTodos, duplicatedTodo]);
    } catch (duplicateError) {
      setError(`Error duplicating todo: ${duplicateError.message}`);
    }
  };

  const handleDelete = async (todoId) => {
    const shouldDelete = typeof window.confirm === 'function'
      ? window.confirm('Delete this todo?')
      : true;

    if (!shouldDelete) {
      return;
    }

    try {
      const response = await fetch(apiUrl(`/api/todos/${todoId}`), { method: 'DELETE' });
      if (!response.ok) {
        throw new Error('Failed to delete todo');
      }

      setTodos((currentTodos) => currentTodos.filter((todo) => todo.id !== todoId));
    } catch (deleteError) {
      setError(`Error deleting todo: ${deleteError.message}`);
    }
  };

  const handleBulkStatus = async (completed) => {
    if (selectedIds.length === 0) {
      return;
    }

    try {
      const response = await fetch(apiUrl('/api/todos/bulk-status'), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids: selectedIds, completed }),
      });

      if (!response.ok) {
        throw new Error('Failed to update selected todos');
      }

      const updatedTodos = await response.json();
      setTodos((currentTodos) => currentTodos.map((todo) => {
        const updatedTodo = updatedTodos.updated.find((entry) => entry.id === todo.id);
        return updatedTodo || todo;
      }));
      setSelectedIds([]);
    } catch (bulkError) {
      setError(`Error updating selected todos: ${bulkError.message}`);
    }
  };

  const handleClearCompleted = async () => {
    try {
      const response = await fetch(apiUrl('/api/todos/completed'), { method: 'DELETE' });
      if (!response.ok) {
        throw new Error('Failed to clear completed todos');
      }

      setTodos((currentTodos) => currentTodos.filter((todo) => !todo.completed));
    } catch (clearError) {
      setError(`Error clearing completed todos: ${clearError.message}`);
    }
  };

  const handleMove = async (todoId, direction) => {
    const orderedTodos = [...todos].sort((left, right) => left.orderIndex - right.orderIndex);
    const index = orderedTodos.findIndex((todo) => todo.id === todoId);
    const nextIndex = direction === 'up' ? index - 1 : index + 1;

    if (index < 0 || nextIndex < 0 || nextIndex >= orderedTodos.length) {
      return;
    }

    const swapped = [...orderedTodos];
    [swapped[index], swapped[nextIndex]] = [swapped[nextIndex], swapped[index]];

    try {
      const response = await fetch(apiUrl('/api/todos/reorder'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids: swapped.map((todo) => todo.id) }),
      });

      if (!response.ok) {
        throw new Error('Failed to reorder todos');
      }

      const reorderedTodos = await response.json();
      setTodos(reorderedTodos);
    } catch (reorderError) {
      setError(`Error reordering todos: ${reorderError.message}`);
    }
  };

  const activeCount = todos.filter((todo) => !todo.completed).length;
  const completedCount = todos.filter((todo) => todo.completed).length;

  return (
    <div className="app-shell">
      <div className="background-orb background-orb-left" />
      <div className="background-orb background-orb-right" />

      <main className="app-card">
        <header className="hero">
          <div>
            <p className="eyebrow">Bootcamp TODO</p>
            <h1>Organize tasks with calm, focused control.</h1>
            <p className="hero-copy">
              Create, edit, prioritize, schedule, duplicate, and complete tasks in a workspace designed for fast scanning.
            </p>
          </div>
          <div className="hero-stats">
            <div>
              <strong>{activeCount}</strong>
              <span>Active</span>
            </div>
            <div>
              <strong>{completedCount}</strong>
              <span>Completed</span>
            </div>
          </div>
        </header>

        <section className="panel filters-panel" aria-label="Task filters">
          <div className="filters-grid">
            <label>
              <span>Search</span>
              <input
                type="search"
                value={filters.search}
                onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
                placeholder="Search title or description"
              />
            </label>
            <label>
              <span>Status</span>
              <select value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}>
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>
            </label>
            <label>
              <span>Priority</span>
              <select value={filters.priority} onChange={(event) => setFilters((current) => ({ ...current, priority: event.target.value }))}>
                <option value="all">All priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </label>
            <label>
              <span>Tag</span>
              <input
                type="text"
                value={filters.tag}
                onChange={(event) => setFilters((current) => ({ ...current, tag: event.target.value }))}
                placeholder="Filter by tag"
              />
            </label>
            <label>
              <span>Sort</span>
              <select value={filters.sortBy} onChange={(event) => setFilters((current) => ({ ...current, sortBy: event.target.value }))}>
                <option value="orderIndex">Manual order</option>
                <option value="createdAt">Created</option>
                <option value="dueDate">Due date</option>
                <option value="title">Title</option>
                <option value="priority">Priority</option>
              </select>
            </label>
            <label>
              <span>Direction</span>
              <select value={filters.sortOrder} onChange={(event) => setFilters((current) => ({ ...current, sortOrder: event.target.value }))}>
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </label>
          </div>
        </section>

        <section className="panel editor-panel" aria-label="Task editor">
          <div className="panel-heading">
            <div>
              <p className="section-kicker">{editingId ? 'Edit task' : 'New task'}</p>
              <h2>{editingId ? 'Update your todo' : 'Add a new todo'}</h2>
            </div>
            {editingId && (
              <button type="button" className="ghost-button" onClick={resetForm}>
                Cancel edit
              </button>
            )}
          </div>

          <form className="todo-form" onSubmit={handleSubmit}>
            <label className="span-2">
              <span>Title</span>
              <input
                type="text"
                value={form.title}
                onChange={(event) => handleFormChange('title', event.target.value)}
                placeholder="Write a task title"
                required
              />
            </label>
            <label className="span-2">
              <span>Description</span>
              <textarea
                rows="3"
                value={form.description}
                onChange={(event) => handleFormChange('description', event.target.value)}
                placeholder="Add supporting details"
              />
            </label>
            <label>
              <span>Due date</span>
              <input
                type="date"
                value={form.dueDate}
                onChange={(event) => handleFormChange('dueDate', event.target.value)}
              />
            </label>
            <label>
              <span>Priority</span>
              <select value={form.priority} onChange={(event) => handleFormChange('priority', event.target.value)}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </label>
            <label className="span-2">
              <span>Tags</span>
              <input
                type="text"
                value={form.tags}
                onChange={(event) => handleFormChange('tags', event.target.value)}
                placeholder="work, planning, design"
              />
            </label>
            <div className="form-actions span-2">
              <button type="submit" className="primary-button">
                {editingId ? 'Save changes' : 'Add todo'}
              </button>
              <button type="button" className="secondary-button" onClick={resetForm}>
                Clear form
              </button>
            </div>
          </form>
        </section>

        <section className="panel actions-panel" aria-label="Bulk actions">
          <div>
            <p className="section-kicker">Bulk actions</p>
            <h2>{selectedIds.length} selected</h2>
          </div>
          <div className="actions-row">
            <button type="button" className="secondary-button" onClick={() => handleBulkStatus(true)} disabled={selectedIds.length === 0}>
              Mark complete
            </button>
            <button type="button" className="secondary-button" onClick={() => handleBulkStatus(false)} disabled={selectedIds.length === 0}>
              Mark active
            </button>
            <button type="button" className="ghost-button" onClick={handleClearCompleted}>
              Clear completed
            </button>
          </div>
        </section>

        <section className="panel list-panel" aria-label="Todo list">
          <div className="panel-heading">
            <div>
              <p className="section-kicker">Task list</p>
              <h2>Todos</h2>
            </div>
            <button type="button" className="ghost-button" onClick={() => loadTodos(filters)}>
              Refresh
            </button>
          </div>

          {loading && <p className="state-message">Loading todos...</p>}
          {error && <p className="state-message error-message">{error}</p>}
          {!loading && !error && todos.length === 0 && <p className="state-message">No todos found. Add your first one.</p>}

          <ul className="todo-list">
            {todos.map((todo) => {
              const dueState = formatDueState(todo);
              return (
                <li key={todo.id} className={`todo-card ${todo.completed ? 'completed' : ''}`}>
                  <div className="todo-card-main">
                    <label className="todo-select">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(todo.id)}
                        onChange={() => toggleSelected(todo.id)}
                      />
                    </label>
                    <button
                      type="button"
                      className={`completion-toggle ${todo.completed ? 'is-complete' : ''}`}
                      onClick={() => handleToggle(todo.id)}
                    >
                      {todo.completed ? 'Completed' : 'Active'}
                    </button>

                    <div className="todo-content">
                      <div className="todo-title-row">
                        <h3>{todo.title}</h3>
                        <div className="badge-row">
                          <span className={`badge priority-${todo.priority}`}>{todo.priority}</span>
                          {dueState && <span className={`badge due-${dueState.toLowerCase().replace(/\s+/g, '-')}`}>{dueState}</span>}
                        </div>
                      </div>
                      {todo.description && <p className="todo-description">{todo.description}</p>}
                      <div className="meta-row">
                        <span>Due: {todo.dueDate || 'No due date'}</span>
                        <span>Created: {todo.createdAt}</span>
                      </div>
                      <div className="tag-row">
                        {todo.tags.map((tag) => (
                          <span key={tag} className="tag-chip">{tag}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="todo-actions">
                    <button type="button" className="ghost-button" onClick={() => startEdit(todo)}>
                      Edit
                    </button>
                    <button type="button" className="ghost-button" onClick={() => handleDuplicate(todo.id)}>
                      Duplicate
                    </button>
                    <button type="button" className="ghost-button" onClick={() => handleMove(todo.id, 'up')}>
                      Up
                    </button>
                    <button type="button" className="ghost-button" onClick={() => handleMove(todo.id, 'down')}>
                      Down
                    </button>
                    <button type="button" className="danger-button" onClick={() => handleDelete(todo.id)}>
                      Delete
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      </main>
    </div>
  );
}

export default App;
