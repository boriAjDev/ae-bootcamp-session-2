const fs = require('fs');
const os = require('os');
const path = require('path');
const request = require('supertest');

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'todo-backend-integration-'));
const tempDbPath = path.join(tempDir, 'todos.db');

process.env.TODO_DB_PATH = tempDbPath;

const { app, db } = require('../../src/app');

afterAll(() => {
  if (db) {
    db.close();
  }

  fs.rmSync(tempDir, { recursive: true, force: true });
  delete process.env.TODO_DB_PATH;
});

describe('Todo integration flow', () => {
  it('supports creating, retrieving, updating, toggling, duplicating, and deleting a todo', async () => {
    const createResponse = await request(app)
      .post('/api/todos')
      .send({
        title: 'Integration Todo',
        description: 'Created in integration test',
        dueDate: '2026-08-15',
        priority: 'high',
        tags: ['integration', 'backend'],
      });

    expect(createResponse.status).toBe(201);
    expect(createResponse.body.title).toBe('Integration Todo');
    expect(createResponse.body.completed).toBe(false);

    const createdId = createResponse.body.id;

    const getResponse = await request(app).get(`/api/todos/${createdId}`);
    expect(getResponse.status).toBe(200);
    expect(getResponse.body.id).toBe(createdId);

    const updateResponse = await request(app)
      .put(`/api/todos/${createdId}`)
      .send({
        title: 'Integration Todo Updated',
        description: 'Updated description',
        dueDate: '2026-08-20',
        priority: 'medium',
        tags: ['integration'],
      });

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.title).toBe('Integration Todo Updated');
    expect(updateResponse.body.priority).toBe('medium');

    const toggleResponse = await request(app).patch(`/api/todos/${createdId}/toggle`);
    expect(toggleResponse.status).toBe(200);
    expect(toggleResponse.body.completed).toBe(true);

    const duplicateResponse = await request(app).post(`/api/todos/${createdId}/duplicate`);
    expect(duplicateResponse.status).toBe(201);
    expect(duplicateResponse.body.title).toContain('(copy)');

    const listResponse = await request(app).get('/api/todos?search=Integration');
    expect(listResponse.status).toBe(200);
    expect(listResponse.body.length).toBeGreaterThanOrEqual(2);

    const deleteResponse = await request(app).delete(`/api/todos/${createdId}`);
    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.body).toEqual({ message: 'Todo deleted successfully', id: createdId });
  });

  it('supports filtering active todos', async () => {
    await request(app).post('/api/todos').send({ title: 'Active Filter Todo' });
    const completedTodo = await request(app).post('/api/todos').send({ title: 'Completed Filter Todo' });
    await request(app).patch(`/api/todos/${completedTodo.body.id}/toggle`);

    const response = await request(app).get('/api/todos?status=active');

    expect(response.status).toBe(200);
    expect(response.body.every((todo) => todo.completed === false)).toBe(true);
  });
});