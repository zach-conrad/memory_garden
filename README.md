# Memory Gardens

A shared 2D garden where memories are planted as blossoms and explored by wandering.

## Milestone 3 - Image and UI changes
Milestone 3 works on allowing for images to be displayed, and fixing some of the UI problems (like interactive elements aggresively triggering popups). This allows the user to work with the bar above and interact with the user profile and other elements without being forced to interact with the memory creation feature. 

Additionally, changes have been made to allow for images to be displayed in the box that appears when the user hovers over a memory, this has all occured on the backend of development. 

App.Tests, have been created to test login in functionality for authentication, to allow users to share memories with one another. 

## Milestone 2 - Backend Integration

Milestone 2 extends the framework of the project by introducing the shared cloud backend using Supabase. Now the application can hold memories beyond the local browser and preps the project for collaborative image uploads and memory sharing. Further, now users have the input option to add images to their memory, though they have yet to be included in the initial memory display. 

## Backend Features 
- Supabase SQL database
- Supabase Storage for uploaded memory images
- Public access for the MP

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
