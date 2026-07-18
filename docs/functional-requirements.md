# Functional Requirements

This document defines the core functional requirements for the TODO application.

## Task Creation and Management

1. The user can create a new task with a title.
2. The user can add an optional description to a task.
3. The user can edit an existing task title and description.
4. The user can delete a task.
5. The user can duplicate an existing task.

## Task Status and Progress

1. The user can mark a task as complete.
2. The user can mark a completed task as incomplete.
3. The user can view completed and incomplete states clearly.
4. The user can bulk mark multiple tasks as complete or incomplete.

## Dates and Scheduling

1. The user can add a due date to a task.
2. The user can edit or remove a task due date.
3. The user can view tasks sorted by due date.
4. The user can identify overdue tasks.
5. The user can identify tasks due today.

## Organization and Prioritization

1. The user can assign a priority level to a task (for example: low, medium, high).
2. The user can assign one or more tags to a task.
3. The user can filter tasks by tag.
4. The user can group tasks by status, due date, or priority.
5. The user can reorder tasks manually.

## Search, Filter, and Sort

1. The user can search tasks by title and description text.
2. The user can filter tasks by completion status.
3. The user can filter tasks by due date range.
4. The user can filter tasks by priority.
5. The user can sort tasks by creation date, due date, priority, or title.

## Views and Usability

1. The user can view all tasks in a single list.
2. The user can view only active tasks.
3. The user can view only completed tasks.
4. The user can clear all completed tasks.
5. The user can see a count of remaining active tasks.

## Data Persistence

1. The application persists tasks so they remain available after page refresh or app restart.
2. The application saves all task fields, including title, description, status, due date, priority, tags, and order.
3. The application restores the previous task state when reopened.

## Validation and Error Handling

1. The application requires a non-empty task title when creating or saving a task.
2. The application prevents saving invalid due dates.
3. The application shows clear validation messages when input is invalid.
4. The application confirms destructive actions such as deleting a task or clearing completed tasks.

## Optional Extended Features

1. The user can set recurring tasks.
2. The user can add subtasks to a task.
3. The user can receive reminders for upcoming due dates.
4. The user can archive tasks instead of deleting them.
5. The user can export and import task data.