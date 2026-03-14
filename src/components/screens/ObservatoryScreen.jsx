import { Bell, RefreshCw, Upload } from "lucide-react";
import Panel from "../layout/Panel";
import EmptyState from "../shared/EmptyState";
import { getScreenIcon } from "../shared/worldIcons";

function ObservatoryScreen({
  state,
  updateSettings,
  clampNumber,
  syncFromSheet,
  fileRef,
  importCsv,
  enableNotifications,
}) {
  const ObservatoryIcon = getScreenIcon("Observatory");

  return (
    <div className="screen-grid">
      <Panel
        title="Observatory"
        subtitle="Quiet controls for how this world sounds, syncs, and stays with you."
        icon={ObservatoryIcon}
        action={<span className="section-chip">Live</span>}
      >
        <div className="two-column">
          <div className="builder-form">
            <label>
              Google Sheet URL
              <input
                type="url"
                placeholder="Paste a Google Sheet URL"
                value={state.settings.sheetUrl}
                onChange={(event) => updateSettings({ sheetUrl: event.target.value })}
              />
            </label>
            <label>
              Refresh interval
              <input
                type="number"
                min="5"
                max="240"
                value={state.settings.refreshMinutes}
                onChange={(event) =>
                  updateSettings({
                    refreshMinutes: clampNumber(event.target.value, 5, 240, 30),
                  })
                }
              />
            </label>
            <label>
              Reminder cadence
              <input
                type="number"
                min="5"
                max="180"
                value={state.settings.reminderMinutes}
                onChange={(event) =>
                  updateSettings({
                    reminderMinutes: clampNumber(event.target.value, 5, 180, 20),
                  })
                }
              />
            </label>
            <label>
              Theme
              <select
                value={state.settings.themeMode}
                onChange={(event) => updateSettings({ themeMode: event.target.value })}
              >
                <option value="night">Night studio</option>
                <option value="dawn">Dawn studio</option>
              </select>
            </label>
          </div>
          <div className="stack-list">
            <button className="button button-primary" type="button" onClick={() => syncFromSheet(false)}>
              <RefreshCw size={16} />
              Sync from sheet
            </button>
            <button className="button button-secondary" type="button" onClick={() => fileRef.current?.click()}>
              <Upload size={16} />
              Import CSV
            </button>
            <button className="button button-ghost" type="button" onClick={enableNotifications}>
              <Bell size={16} />
              Enable notifications
            </button>
            <label className="toggle-line">
              <input
                type="checkbox"
                checked={state.settings.preferAltLinks}
                onChange={(event) => updateSettings({ preferAltLinks: event.target.checked })}
              />
              Prefer alternate links for premium Blind cards
            </label>
            <label className="toggle-line">
              <input
                type="checkbox"
                checked={state.settings.soundEnabled !== false}
                onChange={(event) => updateSettings({ soundEnabled: event.target.checked })}
              />
              Enable ritual sounds
            </label>
            <input ref={fileRef} type="file" accept=".csv,text/csv" hidden onChange={importCsv} />
          </div>
        </div>
      </Panel>

      <Panel
        title="Echo Log"
        subtitle="A lightweight trail of rituals, reminders, and recent moments."
        action={<span className="section-chip">Recent</span>}
      >
        <div className="stack-list">
          {state.reminders.length ? (
            state.reminders.map((entry) => (
              <div className="log-row" key={entry}>
                {entry}
              </div>
            ))
          ) : (
            <EmptyState text="Nothing logged yet. Once you begin rituals, your recent session activity will appear here." />
          )}
        </div>
      </Panel>
    </div>
  );
}

export default ObservatoryScreen;
