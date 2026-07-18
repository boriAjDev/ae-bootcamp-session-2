# Coding Guidelines

This document defines the project's coding style and quality principles for the TODO application.

## Core Principles

- Write code that is clear, predictable, and easy to change.
- Prefer simplicity over cleverness.
- Optimize for readability first, then performance where necessary.
- Keep behavior explicit and avoid hidden side effects.

## General Style

- Use consistent formatting and naming conventions across the codebase.
- Keep functions small and focused on one responsibility.
- Favor descriptive names over abbreviations.
- Avoid deeply nested conditionals; return early when possible.
- Remove dead code, unused imports, and commented-out logic.

## Naming Conventions

- Use meaningful names that reflect intent and domain concepts.
- Use `camelCase` for variables and functions.
- Use `PascalCase` for classes and React components.
- Use `UPPER_SNAKE_CASE` for true constants and environment keys.
- Use file names that match exported module purpose.

## Project Structure

- Group files by feature or responsibility.
- Keep shared utilities in a clearly defined common location.
- Separate business logic from UI rendering logic.
- Avoid circular dependencies between modules.

## JavaScript and React Practices

- Prefer `const` by default; use `let` only when reassignment is needed.
- Use strict equality (`===` and `!==`).
- Prefer pure functions for transformations and derived data.
- Keep React components presentational where possible; move complex logic into hooks/services.
- Keep component props explicit and minimal.
- Avoid prop drilling when state can be colocated or managed through context/state layers.

## State and Data Handling

- Keep state minimal and derive values when possible.
- Normalize data shape where it improves update logic.
- Ensure task state transitions are explicit and testable.
- Validate external input at module boundaries.

## Error Handling

- Fail fast on invalid input.
- Provide clear, actionable error messages.
- Do not swallow errors silently.
- Handle async failures with explicit `try/catch` or rejected promise handling.
- Log errors with enough context for debugging without leaking sensitive data.

## API and Backend Guidelines

- Keep route handlers thin; move business rules to services.
- Validate request payloads and query parameters.
- Return consistent response shapes and status codes.
- Keep configuration (for example `PORT`) centralized and validated at startup.

## Comments and Documentation

- Prefer self-explanatory code over excessive comments.
- Add comments only when intent is not obvious from code.
- Keep README and docs aligned with current implementation.
- Document non-obvious constraints, assumptions, and edge cases.

## Testing and Quality Gates

- Follow the test pyramid: many unit tests, focused integration tests, targeted E2E tests.
- Add tests for new features and regression tests for bug fixes.
- Ensure tests are deterministic and independent.
- Keep linting and test suites passing before merging.

## Performance and Reliability

- Avoid premature optimization.
- Measure bottlenecks before applying complex optimizations.
- Minimize unnecessary re-renders and repeated computations in UI code.
- Use pagination, filtering, and sorting efficiently for task lists.

## Security and Safety

- Never trust client input; validate and sanitize server-side.
- Avoid exposing internal errors directly to users.
- Keep secrets out of source code and version control.
- Use environment variables for sensitive configuration.

## Accessibility and UX Quality

- Build keyboard-accessible interactions by default.
- Ensure semantic HTML and proper labeling for form controls.
- Maintain sufficient color contrast and visible focus indicators.
- Keep copy concise, clear, and user-focused.

## Pull Request Standards

- Keep pull requests small and focused when practical.
- Include a clear description of what changed and why.
- Reference relevant requirements and test evidence.
- Address review feedback with code changes or rationale.

## Definition of Done (Coding)

A change is considered complete when:

1. Code follows project naming and structure conventions.
2. Linting and formatting checks pass.
3. Required tests are added or updated and passing.
4. Documentation is updated when behavior or usage changes.
5. The implementation remains readable, maintainable, and aligned with project requirements.