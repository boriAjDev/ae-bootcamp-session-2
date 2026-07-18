const { test, expect } = require('@playwright/test');
const { TodoPage } = require('./pages/todo-page');

test.describe('Todo workflow', () => {
  test('can add, complete, duplicate, and delete a todo', async ({ page }) => {
    const todoPage = new TodoPage(page);
    await todoPage.goto();

    const title = `E2E Todo ${Date.now()}`;
    await todoPage.addTodo({
      title,
    });

    await expect(todoPage.todoCard(title)).toBeVisible();

    await todoPage.todoCard(title).getByRole('button', { name: 'Edit' }).click();
    await expect(page.getByRole('heading', { name: 'Update your todo' })).toBeVisible();

    const updatedTitle = `${title} updated`;
    await page.getByPlaceholder('Write a task title').fill(updatedTitle);
    await page.getByRole('button', { name: 'Save changes' }).click();
    await expect(todoPage.todoCard(updatedTitle)).toBeVisible();

    await todoPage.todoCard(updatedTitle).getByRole('button', { name: 'Duplicate' }).click();
    await expect(page.getByText(`${updatedTitle} (copy)`)).toBeVisible();

    page.on('dialog', (dialog) => dialog.accept());
    await todoPage.todoCard(updatedTitle).getByRole('button', { name: 'Delete' }).click();
    await expect(todoPage.todoCard(updatedTitle)).toHaveCount(0);
  });

  test('supports search and bulk completion', async ({ page }) => {
    const todoPage = new TodoPage(page);
    await todoPage.goto();

    await page.getByPlaceholder('Search title or description').fill('bootcamp');
    await expect(page.getByRole('heading', { name: 'Finish bootcamp TODO UI' })).toBeVisible();

    await page.getByPlaceholder('Search title or description').fill('');
    await todoPage.todoCard('Plan weekly tasks').getByRole('checkbox').check();
    await todoPage.todoCard('Add due date support').getByRole('checkbox').check();
    await page.getByRole('button', { name: 'Mark complete' }).click();

    await expect(page.getByText('0 selected')).toBeVisible();
    await page.getByRole('button', { name: 'Clear completed' }).click();
    await expect(todoPage.todoCard('Plan weekly tasks')).toHaveCount(0);
    await expect(todoPage.todoCard('Add due date support')).toHaveCount(0);
  });
});
