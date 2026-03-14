import { Bell, Music4, RefreshCw, Upload } from "lucide-react";
import Panel from "../layout/Panel";
import EmptyState from "../shared/EmptyState";
import { getSectionAsset } from "../shared/worldAssets";
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
  const ObservatoryMedia = getSectionAsset("Observatory");

  return (
    <div className="screen-grid">
      <Panel
        title="Observatory"
        subtitle="Quiet controls for sync, ritual atmosphere, and reminders."
        icon={ObservatoryIcon}
        media={ObservatoryMedia}
        action={<span className="section-chip">Live</span>}
      >
        <div className="two-column observatory-grid">
          <div className="builder-form quiet-card">
            <div className="settings-head">
              <strong>Sync</strong>
              <span>Keep work cards flowing in without turning this screen into a dashboard.</span>
            </div>
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
            <button className="button button-primary" type="button" onClick={() => syncFromSheet(false)}>
              <RefreshCw size={16} />
              Sync from sheet
            </button>
            <button className="button button-secondary" type="button" onClick={() => fileRef.current?.click()}>
              <Upload size={16} />
              Import CSV
            </button>
            <input ref={fileRef} type="file" accept=".csv,text/csv" hidden onChange={importCsv} />
          </div>

          <div className="builder-form quiet-card">
            <div className="settings-head">
              <strong>Ritual</strong>
              <span>Adjust theme, reminders, and sound without crowding the rest of the studio.</span>
            </div>
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
              Sound pack
              <select
                value={state.settings.soundPack}
                onChange={(event) => updateSettings({ soundPack: event.target.value })}
              >
                <option value="studio">Studio chime</option>
                <option value="tape">Warm tape</option>
                <option value="glass">Soft glass</option>
              </select>
            </label>
            <label className="toggle-line">
              <input
                type="checkbox"
                checked={state.settings.soundEnabled !== false}
                onChange={(event) => updateSettings({ soundEnabled: event.target.checked })}
              />
              <span>
                <Music4 size={15} className="inline-icon" /> Enable ritual sounds
              </span>
            </label>
          </div>

          <div className="stack-list quiet-card">
            <div className="settings-head">
              <strong>Notifications</strong>
              <span>Keep nudges gentle and only when you want them.</span>
            </div>
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
