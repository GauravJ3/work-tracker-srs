# Work Pulse

A lightweight web app to track work from a Google Sheet with built-in spaced repetition and reminder notifications.

## Features

- Sync tasks/topics from a Google Sheet tab (`gid` aware)
- Spaced repetition review queue (SM-2 style scheduling)
- Gamified progress: XP, levels, streaks, coins, daily quests, achievements
- Blind 75 Arena with category/difficulty filters and quick add-to-tracker
- Direct per-problem links with premium badge + alternative-link preference toggle
- Manual quick-add items
- Browser reminder notifications + reminder history log
- Dashboard metrics (due reviews, total, completed, overdue)

## How to run

1. Open this folder in your terminal.
2. Start a static server:

```bash
python3 -m http.server 8080
```

3. Open `http://localhost:8080` in your browser.

## Google Sheet setup

To allow sync from browser, your sheet should be shareable publicly:

- Open the Google Sheet
- Click **Share**
- Set to **Anyone with the link can view**

The app converts your sheet URL to CSV export format and reads the tab using `gid`.

## Expected columns (flexible)

The importer recognizes common names:

- Title: `title`, `task`, `work`, `topic`, `name`
- Category: `category`, `area`, `project`, `type`
- Status: `status`, `state`
- Due date: `due`, `deadline`, `date`
- Notes: `notes`, `description`, `details`

## Notes

- Data is stored in local browser storage.
- Notifications require browser permission and work best while the tab is open.
