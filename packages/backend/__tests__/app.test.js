const request = require('supertest');
const { app, db } = require('../src/app');

// Close the database connection after all tests
afterAll(() => {
  if (db) {
    db.close();
  }
});

// Test helpers
const createTodo = async (title = 'Temp Todo to Delete') => {
  const response = await request(app)
    .post('/api/todos')
    .send({ title })
    .set('Accept', 'application/json');

  expect(response.status).toBe(201);
  expect(response.body).toHaveProperty('id');
  return response.body;
};

describe('API Endpoints', () => {
  describe('GET /api/todos', () => {
    it('should return all todos', async () => {
      const response = await request(app).get('/api/todos');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);

      const todo = response.body[0];
      expect(todo).toHaveProperty('id');
      expect(todo).toHaveProperty('title');
      expect(todo).toHaveProperty('description');
      expect(todo).toHaveProperty('completed');
      expect(todo).toHaveProperty('createdAt');
      expect(todo).toHaveProperty('updatedAt');
    });

    it('should support filtering by status', async () => {
      const response = await request(app).get('/api/todos?status=active');

      expect(response.status).toBe(200);
      expect(response.body.every((todo) => todo.completed === false)).toBe(true);
    });
  });

  describe('POST /api/todos', () => {
    it('should create a new todo', async () => {
      const newTodo = { title: 'Test Todo', description: 'Test description', priority: 'high', tags: ['work'] };
      const response = await request(app)
        .post('/api/todos')
        .send(newTodo)
        .set('Accept', 'application/json');

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe(newTodo.title);
      expect(response.body.description).toBe(newTodo.description);
      expect(response.body.priority).toBe(newTodo.priority);
      expect(response.body.tags).toEqual(newTodo.tags);
      expect(response.body.completed).toBe(false);
    });

    it('should return 400 if title is missing', async () => {
      const response = await request(app)
        .post('/api/todos')
        .send({})
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Todo title is required');
    });

    it('should return 400 if title is empty', async () => {
      const response = await request(app)
        .post('/api/todos')
        .send({ title: '' })
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Todo title is required');
    });

    it('should return 400 if priority is invalid', async () => {
      const response = await request(app)
        .post('/api/todos')
        .send({ title: 'Invalid Priority Todo', priority: 'urgent' })
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Valid priority is required');
    });
  });

  describe('DELETE /api/todos/:id', () => {
    it('should delete an existing todo', async () => {
      const todo = await createTodo('Todo To Be Deleted');

      const deleteResponse = await request(app).delete(`/api/todos/${todo.id}`);
      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.body).toEqual({ message: 'Todo deleted successfully', id: todo.id });

      const deleteAgain = await request(app).delete(`/api/todos/${todo.id}`);
      expect(deleteAgain.status).toBe(404);
      expect(deleteAgain.body).toHaveProperty('error', 'Todo not found');
    });

    it('should return 404 when todo does not exist', async () => {
      const response = await request(app).delete('/api/todos/999999');
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Todo not found');
    });

    it('should return 400 for invalid id', async () => {
      const response = await request(app).delete('/api/todos/abc');
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Valid todo ID is required');
    });
  });

  describe('PUT /api/todos/:id', () => {
    it('should update an existing todo', async () => {
      const todo = await createTodo('Todo To Be Updated');

      const response = await request(app)
        .put(`/api/todos/${todo.id}`)
        .send({
          title: 'Updated Todo Title',
          description: 'Updated description',
          dueDate: '2026-08-01',
          priority: 'low',
          tags: ['updated'],
        });

      expect(response.status).toBe(200);
      expect(response.body.title).toBe('Updated Todo Title');
      expect(response.body.description).toBe('Updated description');
      expect(response.body.priority).toBe('low');
      expect(response.body.tags).toEqual(['updated']);
      expect(response.body.dueDate).toBe('2026-08-01');
    });
  });

  describe('PATCH /api/todos/:id/toggle', () => {
    it('should toggle completion state', async () => {
      const todo = await createTodo('Todo To Toggle');

      const response = await request(app).patch(`/api/todos/${todo.id}/toggle`);

      expect(response.status).toBe(200);
      expect(response.body.completed).toBe(true);
    });
  });

  describe('POST /api/todos/:id/duplicate', () => {
    it('should duplicate an existing todo', async () => {
      const todo = await createTodo('Todo To Duplicate');

      const response = await request(app).post(`/api/todos/${todo.id}/duplicate`);

      expect(response.status).toBe(201);
      expect(response.body.title).toContain('(copy)');
      expect(response.body.description).toBe(todo.description);
    });
  });

  describe('PATCH /api/todos/bulk-status', () => {
    it('should update multiple todos at once', async () => {
      const first = await createTodo('Bulk Todo One');
      const second = await createTodo('Bulk Todo Two');

      const response = await request(app)
        .patch('/api/todos/bulk-status')
        .send({ ids: [first.id, second.id], completed: true });

      expect(response.status).toBe(200);
      expect(response.body.updated.length).toBe(2);
      expect(response.body.updated.every((todo) => todo.completed === true)).toBe(true);
    });
  });

  describe('PUT /api/todos/reorder', () => {
    it('should reorder todos', async () => {
      const first = await createTodo('Reorder Todo One');
      const second = await createTodo('Reorder Todo Two');

      const response = await request(app)
        .put('/api/todos/reorder')
        .send({ ids: [second.id, first.id] });

      expect(response.status).toBe(200);
      const secondIndex = response.body.findIndex((todo) => todo.id === second.id);
      const firstIndex = response.body.findIndex((todo) => todo.id === first.id);
      expect(secondIndex).toBeGreaterThan(-1);
      expect(firstIndex).toBeGreaterThan(-1);
      expect(secondIndex).toBeLessThan(firstIndex);
    });
  });

  describe('DELETE /api/todos/completed', () => {
    it('should clear completed todos', async () => {
      const todo = await createTodo('Completed Todo To Clear');
      await request(app).patch(`/api/todos/${todo.id}/toggle`);

      const response = await request(app).delete('/api/todos/completed');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.deletedIds)).toBe(true);
    });
  });
});