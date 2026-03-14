# Work Pulse

Work Pulse is a React-based work tracker for Google Sheets, spaced repetition reviews, and Blind 75 practice. This version upgrades the project from a single static script into a cleaner Vite + React app with a more polished visual design and clearer source structure.

## What changed

- rebuilt the UI in React with a clearer `src/` structure
- refreshed the visual system with glass panels, better hierarchy, gradients, and motion
- kept core product features: Google Sheet sync, CSV import, SRS reviews, progress tracking, reminders, and Blind 75 deck building
- improved maintainability by splitting storage, import, sheet, and SRS logic into separate modules
- fixed a few implementation issues, including local date handling for streaks and XP leveling across multiple level thresholds

## Features

- Google Sheets sync using the sheet `gid`
- CSV import fallback
- spaced repetition review queue
- quick-add task capture
- gamified progress with XP, levels, streaks, achievements, and coins
- Blind 75 arena with filters, solve state, and daily deck selection
- local browser notifications and reminder log
- responsive layout for desktop and mobile

## Run locally

```bash
npm install
npm run dev
```

Then open the local Vite URL shown in the terminal.

To create a production build:

```bash
npm run build
```

## Google Sheet setup

To sync directly from the browser:

1. Open your Google Sheet.
2. Click **Share**.
3. Set access to **Anyone with the link can view**.
4. Copy the full sheet URL, including the `gid` if you want a specific tab.

The app reads the sheet through the Google GViz endpoint.

## Expected columns

The importer accepts flexible column names:

- title: `title`, `task`, `work`, `topic`, `name`
- category: `category`, `area`, `project`, `type`
- status: `status`, `state`
- due date: `due`, `deadline`, `date`
- notes: `notes`, `description`, `details`

## Project structure

```text
work-tracker-srs/
  docs/
    architecture.md
  src/
    data/
      blind75.js
    lib/
      importers.js
      sheets.js
      srs.js
      storage.js
      utils.js
    App.jsx
    main.jsx
    styles.css
  index.html
  package.json
  vite.config.js
```

## Notes

- app data is stored in local browser storage
- notifications work best while the tab is open
- the storage key was intentionally bumped in this version to avoid conflicts with the old static app data shape
