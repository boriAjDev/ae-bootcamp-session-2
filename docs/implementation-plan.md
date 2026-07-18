# Implementation Plan

This plan expands the TODO app using the guidance in:

- `.github/copilot-instructions.md`
- `docs/project-overview.md`
- `docs/functional-requirements.md`
- `docs/ui-guidelines.md`
- `docs/testing-guidelines.md`
- `docs/coding-guidelines.md`

## 1. Current Baseline

The project currently has:

- A basic backend API with in-memory SQLite item CRUD (`GET /api/items`, `POST /api/items`, `DELETE /api/items/:id`).
- A simple React frontend for listing, adding, and deleting items.
- Starter unit/integration-style tests for backend and frontend.
- Monorepo scripts for frontend/backend start and test execution, with Playwright configured at root.

## 2. Target Product Scope

Implement core TODO capabilities from the functional requirements:

- Task creation, editing, deletion, duplication.
- Complete/incomplete state management, including bulk updates.
- Due date support with overdue and due-today behavior.
- Priority and tags for organization.
- Search, filters, sorting, and list views (all/active/completed).
- Persistence for all task fields.
- Validation and user-friendly error handling.

Optional features (later phase): recurring tasks, subtasks, reminders, archive, export/import.

## 3. Phase-by-Phase Delivery

## Phase 1: Domain and Configuration Foundation

### Goals

- Move from generic "items" to a full TODO domain model.
- Standardize runtime configuration and startup validation.

### Work

1. Define TODO schema fields: `id`, `title`, `description`, `completed`, `dueDate`, `priority`, `tags`, `orderIndex`, `createdAt`, `updatedAt`.
2. Update backend table design and data access logic to support all fields.
3. Introduce centralized config module for `PORT` default, override, and validation.
4. Replace item-oriented naming in API and frontend contracts with TODO naming.

### Exit Criteria

- Backend and frontend share a consistent TODO object contract.
- App starts with validated configuration and predictable defaults.

## Phase 2: Backend API Expansion

### Goals

- Provide complete API support for required TODO behavior.

### Work

1. Implement CRUD endpoints for todos.
2. Add update operations for completion toggle and bulk status changes.
3. Add endpoints/actions for clear completed and reorder tasks.
4. Support query-driven list behavior:
   - Search by title/description.
   - Filter by status, due date range, priority, and tags.
   - Sort by created date, due date, priority, title, and manual order.
5. Add consistent request validation and response error format.

### Exit Criteria

- All core backend behaviors required by the functional requirements are available.
- Error handling is clear, consistent, and testable.

## Phase 3: Frontend Functional Expansion

### Goals

- Implement complete user workflows for TODO management.

### Work

1. Build task creation/edit forms with validation.
2. Add fields in UI for due date, priority, and tags.
3. Add completion toggle and bulk status actions.
4. Add views for all, active, and completed tasks.
5. Add search/filter/sort controls.
6. Add clear completed and delete confirmations.
7. Add active task count and meaningful empty states.

### Exit Criteria

- Users can perform core TODO workflows end-to-end without manual refresh or API tooling.

## Phase 4: UI Alignment and Design System

### Goals

- Align visual output with modern, minimal UI guidelines and green/gold accent direction.

### Work

1. Define CSS variables for the documented palette.
2. Refactor layout and spacing to a consistent 8px rhythm.
3. Apply visual states for buttons/inputs (hover, focus, disabled, error).
4. Improve task row hierarchy (metadata visible but secondary).
5. Style overdue/due-today/completed states for fast scanning.
6. Ensure responsive behavior across desktop/tablet/mobile.

### Exit Criteria

- UI reflects the design direction in `docs/ui-guidelines.md`.
- Accessibility basics (contrast, focus visibility, keyboard use) are met.

## Phase 5: Testing Program Build-Out

### Goals

- Meet testing requirements across unit, integration, E2E, and configuration behavior.

### Work

1. Unit tests:
   - Validators and utility logic (search/filter/sort/date).
   - State updates and helper functions.
   - Isolated component behavior.
2. Integration tests:
   - Todo CRUD routes.
   - Filtering/sorting/query handling.
   - Error paths and validation failures.
3. Port/configuration tests:
   - Default port fallback.
   - Custom `PORT` usage.
   - Invalid `PORT` handling and startup behavior.
4. E2E tests with Playwright:
   - Critical workflows only.
   - Independent scenarios with stable selectors.
   - Include at least one validation failure scenario.

### Exit Criteria

- Unit, integration, and E2E suites validate core workflows.
- Configuration behavior is covered by automated tests.

## Phase 6: Code Quality and Maintainability Hardening

### Goals

- Align codebase with coding standards and reduce future change risk.

### Work

1. Refactor into clear layers (routes, services, data access, validation, UI logic).
2. Ensure naming and module boundaries follow coding guidelines.
3. Remove dead code and simplify complex conditionals.
4. Keep documentation synchronized with implementation changes.

### Exit Criteria

- Codebase is clean, readable, and easier to extend.
- Quality checks pass consistently before merges.

## Phase 7: Optional Feature Track

### Goals

- Add optional capabilities after core reliability is established.

### Work

1. Choose one optional track first (subtasks or recurring tasks recommended).
2. Add archive behavior as safer alternative to hard delete for selected flows.
3. Add export/import once data model and validation are stable.

### Exit Criteria

- Optional features do not regress core TODO behavior or test stability.

## 4. Suggested Sprint Breakdown

## Sprint 1

- Phase 1 (domain/config foundation).
- Phase 2 core CRUD and validation.

## Sprint 2

- Phase 3 core frontend workflows.
- Phase 4 baseline visual system and responsive layout.

## Sprint 3

- Phase 2 advanced list behaviors (filter/sort/search/bulk/reorder).
- Phase 5 full testing rollout (unit/integration/config/E2E).

## Sprint 4

- Phase 6 maintainability hardening.
- Phase 7 first optional enhancement.

## 5. Cross-Cutting Quality Gates

For each phase, enforce:

1. Lint and test checks pass before merge.
2. New behavior includes tests at the appropriate level.
3. Accessibility checks are included for user-facing interactions.
4. Docs are updated when functionality or behavior changes.

## 6. Definition of Done for Expansion

The expansion is complete when:

1. Core functional requirements are implemented end-to-end.
2. UI behavior and style match the documented UI guidelines.
3. Testing guidelines are met, including unit/integration/E2E and config tests.
4. Coding guidelines are reflected in structure, naming, and maintainability.
5. CI test workflow is stable and reliable for pull requests.
