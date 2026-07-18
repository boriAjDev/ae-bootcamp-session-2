# Testing Guidelines

This document defines testing principles and standards for the TODO application.

## Testing Goals

- Ensure core TODO functionality works reliably across frontend and backend.
- Prevent regressions when features change.
- Keep tests fast, deterministic, and easy to maintain.
- Build confidence for safe refactoring and deployment.

## Test Pyramid Strategy

Use a balanced test pyramid:

1. Unit tests form the largest layer.
2. Integration tests validate interactions between modules and services.
3. End-to-end tests verify complete user workflows from UI to persistence.

## Unit Testing Guidelines

Unit tests should validate small, isolated pieces of logic.

### Scope

- Task model validation (title required, due date validity, priority constraints).
- Utility functions (date formatting, filtering, sorting, search matching).
- Reducers/state updates (create, update, delete, toggle complete).
- UI component behavior in isolation (rendering, state changes, callback execution).

### Principles

- Test one behavior per test case.
- Use clear arrange-act-assert structure.
- Mock external dependencies (network, database, local storage, time).
- Avoid testing implementation details that users do not observe.
- Prefer deterministic inputs and stable expected outputs.

### Minimum Expectations

- Every new utility function must include unit tests.
- Every bug fix should include a regression test.
- Critical task operations must have positive and negative path tests.

## Integration Testing Guidelines

Integration tests should verify that multiple units work together correctly.

### Scope

- API routes with request/response validation.
- Service-to-repository interactions for task CRUD operations.
- Frontend form submission to API layer with mocked or test backend.
- Data persistence behavior across create/edit/delete/complete actions.

### Principles

- Use realistic but controlled test data.
- Prefer testing public module boundaries over internals.
- Validate both successful and failure scenarios.
- Verify error handling paths (validation errors, network errors, server errors).

### Minimum Expectations

- Task create/read/update/delete integration flows are covered.
- Due date and status transitions are covered.
- At least one integration test covers filtering/sorting with persisted data.

## End-to-End Testing Guidelines

End-to-end (E2E) tests should validate complete user journeys in a browser environment.

### Scope

- User can create a task and see it in the list.
- User can add/edit/remove due dates.
- User can mark tasks complete and incomplete.
- User can filter and search tasks.
- User can delete tasks and clear completed tasks.
- Data persists after page reload.

### Principles

- Focus on high-value user-critical paths.
- Keep E2E suite lean to reduce run time and flakiness.
- Avoid brittle selectors; use stable test IDs or semantic selectors.
- Prefer explicit waits for expected UI states rather than fixed delays.

### Minimum Expectations

- At least one happy-path E2E scenario for each major feature area.
- At least one E2E scenario for a validation error state.
- E2E tests run in CI before merge to main.

## Port and Configuration Testing

The application must test runtime configuration, including port handling and environment variables.

### Scope

- Backend uses configured `PORT` value when provided.
- Backend falls back to a default port when `PORT` is missing.
- Invalid `PORT` values are handled safely with clear error or fallback behavior.
- Required environment variables are validated at startup.
- Test-specific configuration does not leak into production defaults.

### Principles

- Isolate environment variable changes per test.
- Reset process environment after each test.
- Avoid hard-coding environment-dependent assumptions.
- Validate startup behavior for both valid and invalid configurations.

### Minimum Expectations

- Automated tests cover default port behavior and custom port overrides.
- Configuration validation tests run in CI.

## Test Data Management

- Use factories/fixtures for consistent task data generation.
- Keep fixtures minimal and purpose-driven.
- Seed and clean test databases deterministically.
- Avoid sharing mutable test state across test files.

## Mocking and Test Doubles

- Mock external services and third-party APIs.
- Prefer lightweight fakes/stubs over complex global mocks.
- Do not mock the unit under test.
- Use contract tests when integrating with external APIs.

## Performance and Reliability

- Keep unit tests fast; avoid unnecessary I/O.
- Run tests in parallel where safe.
- Quarantine and fix flaky tests quickly.
- Track and reduce slow test files over time.

## Accessibility and UI Quality

- Include tests for keyboard navigation and focus behavior.
- Validate labels and roles for critical form controls.
- Include at least one automated accessibility check in CI for core screens.

## CI/CD Expectations

- Run unit and integration tests on every pull request.
- Run E2E tests on pull requests and before production release.
- Fail the pipeline when required test suites fail.
- Publish test reports and failure logs for debugging.

## Coverage and Quality Gates

- Maintain meaningful coverage across core business logic.
- Prioritize behavior coverage over percentage targets alone.
- Set baseline thresholds (for example: statements, branches, functions, lines) and increase gradually.
- Require tests for all new features and critical bug fixes.

## Naming and Organization

- Keep test names descriptive and behavior-focused.
- Co-locate tests with source files where practical, or use consistent test directories.
- Use predictable naming conventions (`*.test.js`, `*.spec.js`).
- Group related assertions logically; avoid oversized test cases.

## Definition of Done (Testing)

A feature is considered done only when:

1. Unit tests are added or updated.
2. Integration tests are added or updated where applicable.
3. End-to-end tests are added or updated for user-facing flows.
4. Port/configuration behavior is tested when runtime configuration is involved.
5. All required test suites pass in CI.