class TodoPage {
  constructor(page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/');
  }

  titleInput() {
    return this.page.getByPlaceholder('Write a task title');
  }

  descriptionInput() {
    return this.page.getByPlaceholder('Add supporting details');
  }

  form() {
    return this.page.locator('.todo-form');
  }

  addButton() {
    return this.page.getByRole('button', { name: 'Add todo' });
  }

  todoCard(title) {
    const escapedTitle = title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return this.page.locator('.todo-card').filter({ has: this.page.getByRole('heading', { name: new RegExp(`^${escapedTitle}$`) }) });
  }

  async addTodo({ title, description = '', dueDate = '', priority = 'medium', tags = '' }) {
    await this.titleInput().fill(title);
    if (description) {
      await this.descriptionInput().fill(description);
    }
    if (dueDate) {
      await this.form().locator('input[type="date"]').fill(dueDate);
    }
    await this.form().locator('select').selectOption(priority);
    await this.form().locator('input[placeholder="work, planning, design"]').fill(tags);
    await this.addButton().click();
  }
}

module.exports = { TodoPage };
