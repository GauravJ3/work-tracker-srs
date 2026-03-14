# Work Pulse

Work Pulse is a React-based work tracker for Google Sheets, spaced repetition reviews, and Blind 75 practice. The current version is designed as a premium focus trainer with deck-based study flows, immersive review rituals, and a smoother, more intentional interface.

## What changed

- rebuilt the UI in React with a clearer `src/` structure
- reshaped the app into a deck-first focus trainer with immersive review sessions
- refreshed the visual system with stronger hierarchy, cinematic panels, gradients, and smoother motion
- kept core product features: Google Sheet sync, CSV import, SRS reviews, progress tracking, reminders, and Blind 75 deck building
- added multiple deck types, including smart decks and custom decks you can curate yourself
- improved maintainability by splitting storage, import, sheet, and SRS logic into separate modules
- fixed a few implementation issues, including local date handling for streaks and XP leveling across multiple level thresholds

## Features

- Google Sheets sync using the sheet `gid`
- CSV import fallback
- spaced repetition review queue
- quick-add task capture
- smart ritual decks for due work, recovery, flow, and Blind practice
- custom deck creation so users can build their own review stacks
- immersive focus session overlay for one-card-at-a-time review
- gamified progress with XP, levels, streaks, achievements, and coins
- Blind 75 library with filters, solve state, and routing into custom decks
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

To run the automated test suite:

```bash
npm test
```

To keep tests running while you work:

```bash
npm run test:watch
```

Current coverage includes:

- integration tests for starter onboarding, ritual flow, and deck-to-archive routing
- unit tests for CSV importing and local-storage hydration

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
