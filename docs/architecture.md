# Architecture Notes

## Frontend

- `src/App.jsx`: main application shell, state management, and interaction handlers
- `src/data/blind75.js`: Blind 75 dataset and problem metadata
- `src/lib/storage.js`: local storage persistence and default app state
- `src/lib/srs.js`: spaced repetition scheduling helpers
- `src/lib/importers.js`: CSV parsing and row-to-item conversion
- `src/lib/sheets.js`: Google Sheets GViz import utilities
- `src/styles.css`: design system, layout, and motion

## Data model

Each tracked item keeps:

- identity: `id`, `source`, optional `blindId`
- task details: `title`, `category`, `status`, `notes`, `dueDate`
- spaced repetition state: `repetitions`, `interval`, `ease`, `lastReviewed`, `nextReview`

## Notable fixes in this version

- moved from a single large script to a React/Vite app with a clearer source layout
- bumped local storage key to avoid shape conflicts with the older static implementation
- corrected day tracking to use local calendar dates instead of UTC slicing
- improved level-up handling so large XP gains can cross multiple levels safely
- made imported row/header parsing more explicit and easier to maintain
