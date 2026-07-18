import React, { act } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import App from '../App';

window.confirm = jest.fn(() => true);

const todos = [
  {
    id: 1,
    title: 'Test Todo 1',
    description: 'First test todo',
    completed: false,
    dueDate: '2026-07-18',
    priority: 'high',
    tags: ['work'],
    orderIndex: 0,
    createdAt: '2026-07-18 00:00:00',
    updatedAt: '2026-07-18 00:00:00',
  },
  {
    id: 2,
    title: 'Test Todo 2',
    description: 'Second test todo',
    completed: true,
    dueDate: null,
    priority: 'medium',
    tags: ['home'],
    orderIndex: 1,
    createdAt: '2026-07-18 00:00:00',
    updatedAt: '2026-07-18 00:00:00',
  },
];

const server = setupServer(
  rest.get('/api/todos', (req, res, ctx) => res(ctx.status(200), ctx.json(todos))),
  rest.post('/api/todos', (req, res, ctx) => {
    const { title } = req.body;

    if (!title || title.trim() === '') {
      return res(ctx.status(400), ctx.json({ error: 'Todo title is required' }));
    }

    return res(
      ctx.status(201),
      ctx.json({
        id: 3,
        title,
        description: '',
        completed: false,
        dueDate: null,
        priority: 'medium',
        tags: [],
        orderIndex: 2,
        createdAt: '2026-07-18 00:00:00',
        updatedAt: '2026-07-18 00:00:00',
      })
    );
  }),
  rest.put('/api/todos/:id', (req, res, ctx) => {
    const { id } = req.params;
    const { title } = req.body;

    return res(
      ctx.status(200),
      ctx.json({
        id: Number(id),
        title,
        description: req.body.description || '',
        completed: false,
        dueDate: req.body.dueDate || null,
        priority: req.body.priority || 'medium',
        tags: req.body.tags || [],
        orderIndex: 0,
        createdAt: '2026-07-18 00:00:00',
        updatedAt: '2026-07-18 00:00:00',
      })
    );
  }),
  rest.patch('/api/todos/:id/toggle', (req, res, ctx) =>
    res(ctx.status(200), ctx.json({ ...todos[0], completed: true }))
  ),
  rest.post('/api/todos/:id/duplicate', (req, res, ctx) =>
    res(ctx.status(201), ctx.json({ ...todos[0], id: 3, title: 'Test Todo 1 (copy)' }))
  ),
  rest.patch('/api/todos/bulk-status', (req, res, ctx) => res(ctx.status(200), ctx.json({ updated: [] }))),
  rest.put('/api/todos/reorder', (req, res, ctx) => res(ctx.status(200), ctx.json(todos))),
  rest.delete('/api/todos/completed', (req, res, ctx) => res(ctx.status(200), ctx.json({ deletedIds: [2] }))),
  rest.delete('/api/todos/:id', (req, res, ctx) => res(ctx.status(200), ctx.json({ message: 'Todo deleted successfully' })))
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('App Component', () => {
  test('renders the workspace shell', async () => {
    await act(async () => {
      render(<App />);
    });

    expect(screen.getByText('Bootcamp TODO')).toBeInTheDocument();
    expect(screen.getByText('Organize tasks with calm, focused control.')).toBeInTheDocument();
  });

  test('loads and displays todos', async () => {
    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.getByText('Test Todo 1')).toBeInTheDocument();
      expect(screen.getByText('Test Todo 2')).toBeInTheDocument();
    });
  });

  test('adds a new todo', async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(<App />);
    });

    const input = screen.getByPlaceholderText('Write a task title');
    await act(async () => {
      await user.type(input, 'New Test Todo');
    });

    const submitButton = screen.getByText('Add todo');
    await act(async () => {
      await user.click(submitButton);
    });

    await waitFor(() => {
      expect(screen.getByText('New Test Todo')).toBeInTheDocument();
    });
  });

  test('shows empty state when no items', async () => {
    server.use(rest.get('/api/todos', (req, res, ctx) => res(ctx.status(200), ctx.json([]))));

    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.getByText('No todos found. Add your first one.')).toBeInTheDocument();
    });
  });
});
