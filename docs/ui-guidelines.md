# UI Guidelines

This document defines the core UI guidelines for the TODO application.

## Design Direction

- The interface should feel modern, clean, and intentional.
- The visual style should be minimalistic, with generous spacing and low clutter.
- Content should be easy to scan quickly, with clear hierarchy and strong readability.
- Decorative elements should be subtle and purposeful, not distracting.

## Color System

Use a neutral base with rich green and gold accents.

### Core Palette

- Primary Green: `#1F7A4C`
- Deep Green: `#145A36`
- Gold Accent: `#D4A017`
- Soft Gold: `#E8C867`
- Background: `#F7F8F5`
- Surface: `#FFFFFF`
- Text Primary: `#1B1F1D`
- Text Secondary: `#5A645F`
- Border/Subtle Divider: `#DDE3DD`

### Usage Rules

- Use green for primary actions, active states, and key highlights.
- Use gold sparingly for emphasis, badges, and important callouts.
- Keep backgrounds light and neutral to preserve a minimal look.
- Maintain strong contrast for accessibility in all text and controls.

## Typography

- Use one modern sans-serif typeface consistently across the app.
- Prefer clear weights and sizes over decorative typography.
- Keep headings concise and distinct from body text.
- Maintain readable body text size (minimum 16px for primary content).

## Layout and Spacing

- Use a simple grid with consistent alignment.
- Apply an 8px spacing system for margins, gaps, and padding.
- Keep task rows compact but not cramped.
- Ensure enough white space between sections to reduce cognitive load.

## Components

### Buttons

- Primary button: green background with white text.
- Secondary button: neutral background with green border/text.
- Accent button (limited use): gold background with dark text.
- Button states (hover, focus, disabled) must be visually distinct.

### Inputs and Forms

- Inputs should have clear borders, labels, and focus states.
- Use green focus rings for active form controls.
- Show validation messages inline and in plain language.
- Required fields should be clearly indicated.

### Task List Items

- Each task item should display title, completion state, and optional metadata.
- Due dates and priority should be visually secondary but easy to find.
- Completed tasks should remain readable but visually de-emphasized.
- Avoid heavy card styling; prefer light separators and clean rows.

### Tags and Status Indicators

- Use soft green tones for positive/complete status.
- Use gold accents for priority or attention indicators.
- Avoid using color alone; pair color with text/icon indicators.

## Icons and Visual Elements

- Use simple, outline-style icons for consistency.
- Keep icon size and stroke weight uniform.
- Use subtle shadows and borders only when they improve hierarchy.
- Avoid excessive gradients or ornamental effects.

## Motion and Interaction

- Use short, subtle transitions (150ms-250ms) for hover and state changes.
- Animate only where it improves clarity (for example, task completion feedback).
- Avoid excessive motion to preserve a calm, minimal interface.

## Accessibility

- Meet WCAG 2.1 AA contrast requirements for text and interactive elements.
- Ensure all interactive controls are keyboard accessible.
- Provide visible focus states on all actionable elements.
- Support screen readers with semantic structure and clear labels.

## Responsive Behavior

- The UI should work smoothly on desktop, tablet, and mobile.
- Keep controls thumb-friendly on small screens.
- Preserve task readability and action clarity at all breakpoints.
- Avoid hidden critical actions behind non-obvious gestures.

## Content and Tone

- Use concise, direct labels and helper text.
- Keep empty states encouraging and informative.
- Error messages should explain the issue and suggest the next step.
- Confirmation and success feedback should be clear but lightweight.