# Memory Gardens

A shared 2D garden where memories are planted as blossoms and explored by wandering.

## Milestone 1 — Core Frontend

### Landing Page

The app opens on an animated landing page that introduces the concept and invites the visitor into the garden with an "Enter the garden" button.

### Garden Environment

The garden is a pannable 2D world (4000 × 3000 px). Visitors drag to move the viewport across the space. A top bar shows the garden name, a search field, and a live memory count. A status line at the bottom guides new visitors.

### Memory Placement System

Clicking any open patch of ground converts the screen coordinates to world coordinates and marks that spot for planting. Each memory is stored with its `x`/`y` position so blossoms appear exactly where they were planted across sessions.

### Memory Creation Interface

Clicking open ground opens a form where the visitor fills in a title (required, up to 80 characters), the memory itself (required, up to 2000 characters), and an optional name (defaults to "Anonymous"). Submitting plants the memory and immediately adds its blossom to the garden.

### Memory Viewing

Clicking any blossom opens a panel showing the title, author, planting date, and full text of the memory. Closing the panel returns the visitor to the garden.

## Storage

In Milestone 1, memories are persisted in the browser via **localStorage** (key: `memory-gardens:memories`). No account or network connection is required. The garden is local to the device and browser.

If Supabase environment variables are present, the app switches automatically to the shared cloud garden (Milestone 2).

## Tech Stack

- React 18 + TypeScript
- Vite
- Framer Motion (page and panel animations)
- Vitest + Testing Library

## Getting Started

```bash
npm install
npm run dev
```

Run tests:

```bash
npm test
```
