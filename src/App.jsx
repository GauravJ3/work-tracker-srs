import { useEffect, useMemo, useRef, useState } from "react";
import { blindItems } from "./data/blind75";
import { createManualItem, mergeImportedItems, parseCsv, rowsToItems } from "./lib/importers";
import { fetchSheetRows } from "./lib/sheets";
import { applySrsReview, createDefaultSrs, isDue } from "./lib/srs";
import { defaultState, loadState, saveState } from "./lib/storage";
import { clampNumber, createId, dayKey, formatDate, formatRelative, normalize, qualityLabel } from "./lib/utils";

const achievementMap = {
  sheet_rookie: "Connected your first sheet",
  reviewer_10: "Completed 10 reviews",
  solver_10: "Solved 10 Blind 75 problems",
  level_5: "Reached level 5",
  streak_7: "Held a 7-day streak",
  inbox_zero: "Cleared every due review",
};

function App() {
  const [state, setState] = useState(() => ensureDailyState(loadState()));
  const [status, setStatus] = useState("Ready when you are.");
  const [challenge, setChallenge] = useState("Roll a challenge to get a fresh focus sprint.");
  const [form, setForm] = useState({ title: "", category: "" });
  const [filters, setFilters] = useState({
    search: "",
    category: "All categories",
    difficulty: "All difficulty",
  });
  const [sparkles, setSparkles] = useState([]);
  const fileRef = useRef(null);

  useEffect(() => {
    saveState(state);
  }, [state]);

  useEffect(() => {
    document.documentElement.dataset.theme = state.settings.themeMode;
  }, [state.settings.themeMode]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setState((current) => ensureDailyState({ ...current }));
    }, 60000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!state.settings.sheetUrl) return undefined;
    const minutes = clampNumber(state.settings.refreshMinutes, 5, 240, 30);
    const timer = window.setInterval(() => {
      syncFromSheet(true);
    }, minutes * 60 * 1000);
    return () => window.clearInterval(timer);
  }, [state.settings.sheetUrl, state.settings.refreshMinutes]);

  useEffect(() => {
    const minutes = clampNumber(state.settings.reminderMinutes, 5, 180, 20);
    const timer = window.setInterval(() => {
      const due = state.items.filter(isDue);
      if (!due.length) return;
      const next = due[0];
      pushReminder(`Review ${next.title}`, `${due.length} item${due.length > 1 ? "s are" : " is"} waiting.`);
    }, minutes * 60 * 1000);
    return () => window.clearInterval(timer);
  }, [state.items, state.settings.reminderMinutes, state.settings.notifications]);

  const dueItems = useMemo(() => state.items.filter(isDue), [state.items]);
  const completedCount = useMemo(
    () => state.items.filter((item) => /done|complete/i.test(item.status)).length,
    [state.items],
  );
  const overdueCount = useMemo(
    () =>
      state.items.filter((item) => {
        if (!item.dueDate) return false;
        const value = new Date(item.dueDate).getTime();
        return !Number.isNaN(value) && value < Date.now();
      }).length,
    [state.items],
  );
  const solvedCount = state.game.solvedBlind.length;
  const focusScore = Math.min(
    100,
    Math.round(
      (dueItems.length ? 45 : 70) +
        Math.min(25, state.game.streak * 3) +
        Math.min(20, (completedCount / Math.max(1, state.items.length)) * 20),
    ),
  );
  const levelFloor = (state.game.level - 1) * 120;
  const levelGoal = state.game.level * 120;
  const levelProgress = Math.max(
    0,
    Math.min(100, Math.round(((state.game.xp - levelFloor) / (levelGoal - levelFloor)) * 100)),
  );

  const blindCategories = useMemo(
    () => ["All categories", ...new Set(blindItems.map((item) => item.category))],
    [],
  );

  const filteredBlind = useMemo(() => {
    const normalizedSearch = normalize(filters.search).replaceAll("_", "");
    return blindItems.filter((item) => {
      const matchesSearch =
        !normalizedSearch || normalize(item.title).replaceAll("_", "").includes(normalizedSearch);
      const matchesCategory =
        filters.category === "All categories" || item.category === filters.category;
      const matchesDifficulty =
        filters.difficulty === "All difficulty" || item.difficulty === filters.difficulty;
      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  }, [filters]);

  function updateSettings(partial) {
    setState((current) => ({
      ...current,
      settings: {
        ...current.settings,
        ...partial,
      },
    }));
  }

  function addLog(message) {
    setState((current) => ({
      ...current,
      reminders: [`${new Date().toLocaleTimeString()}: ${message}`, ...current.reminders].slice(0, 40),
    }));
  }

  function ensureAchievementDraft(nextState) {
    const unlocked = new Set(nextState.game.unlocked);
    if (nextState.items.some((item) => item.source === "sheet")) unlocked.add("sheet_rookie");
    if (nextState.game.totalReviews >= 10) unlocked.add("reviewer_10");
    if (nextState.game.solvedBlind.length >= 10) unlocked.add("solver_10");
    if (nextState.game.level >= 5) unlocked.add("level_5");
    if (nextState.game.streak >= 7) unlocked.add("streak_7");
    if (nextState.items.length > 0 && nextState.items.every((item) => !isDue(item))) unlocked.add("inbox_zero");
    return {
      ...nextState,
      game: {
        ...nextState.game,
        unlocked: [...unlocked],
      },
    };
  }

  function awardXp(amount, reason, flare = "mint") {
    setState((current) => {
      const next = structuredClone(current);
      next.game.xp += amount;
      while (next.game.xp >= next.game.level * 120) {
        next.game.level += 1;
        next.game.coins += 10;
      }
      return ensureAchievementDraft(next);
    });
    addLog(`+${amount} XP: ${reason}`);
    launchSparkles(flare);
  }

  function launchSparkles(tone = "mint") {
    const burst = Array.from({ length: 10 }, (_, index) => ({
      id: `${tone}-${Date.now()}-${index}`,
      left: 12 + Math.random() * 76,
      delay: Math.random() * 120,
      duration: 1200 + Math.random() * 900,
      tone,
    }));
    setSparkles((current) => [...current, ...burst]);
    window.setTimeout(() => {
      setSparkles((current) => current.filter((piece) => !burst.some((added) => added.id === piece.id)));
    }, 2200);
  }

  function pushReminder(title, body) {
    addLog(title);
    if (!state.settings.notifications || !("Notification" in window)) return;
    if (Notification.permission === "granted") {
      new Notification(title, { body });
    }
  }

  async function enableNotifications() {
    if (!("Notification" in window)) {
      setStatus("Notifications are not supported in this browser.");
      return;
    }

    const permission = await Notification.requestPermission();
    updateSettings({ notifications: permission === "granted" });
    setStatus(permission === "granted" ? "Notifications enabled." : "Notifications were not granted.");
  }

  async function syncFromSheet(isSilent = false) {
    if (!state.settings.sheetUrl) {
      setStatus("Paste a Google Sheet URL first.");
      return;
    }

    if (!isSilent) setStatus("Syncing from Google Sheets...");

    try {
      const rows = await fetchSheetRows(state.settings.sheetUrl);
      const imported = rowsToItems(rows, "sheet");
      setState((current) => {
        const merged = mergeImportedItems(current.items, imported);
        return ensureAchievementDraft({
          ...current,
          items: merged,
        });
      });
      awardXp(24, "Sheet sync", "blue");
      setStatus(`Synced ${imported.length} rows successfully.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Sheet sync failed.");
    }
  }

  async function importCsv(event) {
    const [file] = event.target.files || [];
    if (!file) return;

    try {
      const text = await file.text();
      const rows = parseCsv(text);
      const imported = rowsToItems(rows, "sheet");
      setState((current) => ({
        ...current,
        items: mergeImportedItems(current.items, imported),
      }));
      awardXp(18, "CSV import", "gold");
      setStatus(`Imported ${imported.length} rows from CSV.`);
    } catch {
      setStatus("Could not read that CSV file.");
    } finally {
      event.target.value = "";
    }
  }

  function addManualTask(event) {
    event.preventDefault();
    if (!form.title.trim()) return;
    const item = createManualItem(form);
    setState((current) => ({
      ...current,
      items: [item, ...current.items],
    }));
    setForm({ title: "", category: "" });
    awardXp(8, "Quick add", "pink");
    setStatus(`Added ${item.title}.`);
  }

  function reviewItem(itemId, quality) {
    setState((current) => {
      const items = current.items.map((item) =>
        item.id === itemId ? applySrsReview(item, quality) : item,
      );
      const next = ensureDailyState({
        ...current,
        items,
        game: {
          ...current.game,
          totalReviews: current.game.totalReviews + 1,
          daily: {
            ...current.game.daily,
            reviews: current.game.daily.reviews + 1,
          },
        },
      });
      return ensureAchievementDraft(next);
    });
    awardXp({ 1: 2, 3: 6, 4: 10, 5: 14 }[quality] || 5, `Review ${qualityLabel(quality)}`, "mint");
  }

  function completeItem(itemId) {
    setState((current) => ({
      ...current,
      items: current.items.map((item) =>
        item.id === itemId ? { ...item, status: "completed" } : item,
      ),
    }));
    awardXp(12, "Task completed", "gold");
  }

  function addBlindItem(item) {
    setState((current) => {
      if (current.items.some((existing) => existing.blindId === item.id)) return current;
      return {
        ...current,
        items: [
          {
            id: createId("blind"),
            blindId: item.id,
            title: item.title,
            category: item.category,
            difficulty: item.difficulty,
            status: "open",
            source: "blind75",
            notes: "",
            dueDate: "",
            srs: createDefaultSrs(),
          },
          ...current.items,
        ],
      };
    });
    awardXp(6, "Blind 75 added", "blue");
  }

  function toggleSolved(itemId) {
    setState((current) => {
      if (current.game.solvedBlind.includes(itemId)) return current;
      const next = ensureDailyState({
        ...current,
        game: {
          ...current.game,
          solvedBlind: [...current.game.solvedBlind, itemId],
          coins: current.game.coins + 5,
          daily: {
            ...current.game.daily,
            solves: current.game.daily.solves + 1,
          },
        },
      });
      return ensureAchievementDraft(next);
    });
    awardXp(20, "Problem solved", "pink");
  }

  function loadBlindDeck() {
    let count = 0;
    setState((current) => {
      const existing = new Set(current.items.map((item) => item.blindId).filter(Boolean));
      const additions = blindItems
        .filter((item) => !existing.has(item.id))
        .map((item) => ({
          id: createId("blind"),
          blindId: item.id,
          title: item.title,
          category: item.category,
          difficulty: item.difficulty,
          status: "open",
          source: "blind75",
          notes: "",
          dueDate: "",
          srs: createDefaultSrs(),
        }));
      count = additions.length;
      return {
        ...current,
        items: [...current.items, ...additions],
      };
    });
    awardXp(25, "Blind 75 loaded", "gold");
    setStatus(`Added ${count} Blind 75 prompts to your tracker.`);
  }

  function toggleDailyDeck(itemId) {
    setState((current) => {
      const hasIt = current.game.dailyDeck.includes(itemId);
      return {
        ...current,
        game: {
          ...current.game,
          dailyDeck: hasIt
            ? current.game.dailyDeck.filter((entry) => entry !== itemId)
            : [...current.game.dailyDeck, itemId],
        },
      };
    });
  }

  function rollChallenge() {
    const duePool = dueItems.map((item) => `Review "${item.title}" and push it forward.`);
    const blindPool = blindItems
      .filter((item) => !state.game.solvedBlind.includes(item.id))
      .slice(0, 20)
      .map((item) => `Solve "${item.title}" from ${item.category}.`);
    const pool = [...duePool, ...blindPool];
    setChallenge(
      pool.length
        ? pool[Math.floor(Math.random() * pool.length)]
        : "You cleared the board. Take a breather and come back sharper.",
    );
  }

  return (
    <div className="page-shell">
      <div className="orb orb-a" />
      <div className="orb orb-b" />
      <div className="spark-layer" aria-hidden="true">
        {sparkles.map((piece) => (
          <span
            key={piece.id}
            className={`spark spark-${piece.tone}`}
            style={{
              left: `${piece.left}%`,
              animationDelay: `${piece.delay}ms`,
              animationDuration: `${piece.duration}ms`,
            }}
          />
        ))}
      </div>

      <main className="app-shell">
        <section className="hero-panel">
          <div className="hero-copy">
            <p className="eyebrow">Work tracking meets memory design</p>
            <h1>Work Pulse</h1>
            <p className="hero-text">
              A calmer, sharper workspace for your sheet-backed tasks, spaced repetition reviews,
              and coding practice deck.
            </p>
            <div className="hero-actions">
              <button className="button button-primary" onClick={() => syncFromSheet(false)}>
                Sync sheet
              </button>
              <button className="button button-secondary" onClick={rollChallenge}>
                Roll challenge
              </button>
            </div>
            <p className="status-line">{status}</p>
          </div>

          <div className="hero-dashboard">
            <div className="hero-card glass">
              <span>Focus score</span>
              <strong>{focusScore}</strong>
              <p>{dueItems.length ? "A few reviews want your attention." : "You are in a clean zone."}</p>
            </div>
            <div className="hero-card hero-card-accent">
              <span>Level {state.game.level}</span>
              <strong>{state.game.xp} XP</strong>
              <div className="progress-track">
                <span style={{ width: `${levelProgress}%` }} />
              </div>
              <p>{state.game.coins} coins collected</p>
            </div>
            <div className="hero-radar">
              <div className="radar-ring radar-ring-a" />
              <div className="radar-ring radar-ring-b" />
              <div className="radar-core" />
              <div className="radar-copy">
                <span>Daily streak</span>
                <strong>{state.game.streak} days</strong>
              </div>
            </div>
          </div>
        </section>

        <section className="metrics-grid">
          <MetricCard label="Due reviews" value={dueItems.length} note="Keep the queue fresh" />
          <MetricCard label="Total items" value={state.items.length} note="Across all sources" />
          <MetricCard label="Completed" value={completedCount} note="Momentum this cycle" />
          <MetricCard label="Blind 75 solved" value={`${solvedCount}/75`} note="Interview muscle" />
          <MetricCard label="Overdue" value={overdueCount} note="Deadlines to rescue" />
        </section>

        <section className="workspace-grid">
          <div className="main-column">
            <SectionCard
              title="Control Center"
              aside={<span className="section-chip">Auto refresh ready</span>}
            >
              <div className="control-grid">
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
                  Refresh interval (minutes)
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
                  Reminder cadence (minutes)
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
                  Theme mood
                  <select
                    value={state.settings.themeMode}
                    onChange={(event) => updateSettings({ themeMode: event.target.value })}
                  >
                    <option value="night">Night glass</option>
                    <option value="dawn">Dawn paper</option>
                  </select>
                </label>
              </div>

              <div className="action-row">
                <button className="button button-primary" onClick={() => syncFromSheet(false)}>
                  Sync from sheet
                </button>
                <button className="button button-secondary" onClick={() => fileRef.current?.click()}>
                  Import CSV
                </button>
                <button className="button button-ghost" onClick={enableNotifications}>
                  Enable notifications
                </button>
                <label className="checkbox-row">
                  <input
                    type="checkbox"
                    checked={state.settings.preferAltLinks}
                    onChange={(event) => updateSettings({ preferAltLinks: event.target.checked })}
                  />
                  Prefer alternative links for premium Blind 75 prompts
                </label>
                <input ref={fileRef} type="file" accept=".csv,text/csv" hidden onChange={importCsv} />
              </div>
            </SectionCard>

            <SectionCard
              title="Due For Review"
              aside={<span className="section-chip">{dueItems.length} live</span>}
            >
              <div className="stack-list">
                {dueItems.length ? (
                  dueItems.map((item) => (
                    <article className="task-card" key={item.id}>
                      <div className="task-head">
                        <div>
                          <strong>{item.title}</strong>
                          <p>{item.category}</p>
                        </div>
                        <span className="pill">Interval {item.srs.interval}d</span>
                      </div>
                      <p className="task-meta">Next review {formatDate(item.srs.nextReview)}</p>
                      <div className="review-row">
                        {[1, 3, 4, 5].map((quality) => (
                          <button
                            key={quality}
                            className={`review-button review-${quality}`}
                            onClick={() => reviewItem(item.id, quality)}
                          >
                            {qualityLabel(quality)}
                          </button>
                        ))}
                      </div>
                    </article>
                  ))
                ) : (
                  <EmptyState text="Nothing is due right now. That is a lovely place to be." />
                )}
              </div>
            </SectionCard>

            <SectionCard
              title="All Work Items"
              aside={<span className="section-chip">{state.items.length} tracked</span>}
            >
              <div className="stack-list">
                {state.items.length ? (
                  state.items.map((item) => {
                    const done = /done|complete/i.test(item.status);
                    const linkedBlind = item.blindId
                      ? blindItems.find((entry) => entry.id === item.blindId)
                      : null;
                    const href = linkedBlind
                      ? linkedBlind.premium && state.settings.preferAltLinks
                        ? linkedBlind.alt
                        : linkedBlind.link
                      : "";
                    return (
                      <article className="task-card task-card-soft" key={item.id}>
                        <div className="task-head">
                          <div>
                            <strong>
                              {href ? (
                                <a href={href} target="_blank" rel="noreferrer">
                                  {item.title}
                                </a>
                              ) : (
                                item.title
                              )}
                            </strong>
                            <p>
                              {item.category} • {item.status}
                            </p>
                          </div>
                          {item.dueDate ? <span className="pill">{formatRelative(item.dueDate)}</span> : null}
                        </div>
                        <p className="task-meta">Next review {formatDate(item.srs.nextReview)}</p>
                        {!done ? (
                          <button className="button button-ghost" onClick={() => completeItem(item.id)}>
                            Complete +12XP
                          </button>
                        ) : null}
                      </article>
                    );
                  })
                ) : (
                  <EmptyState text="No items yet. Sync a sheet or add a task to start shaping the space." />
                )}
              </div>
            </SectionCard>
          </div>

          <aside className="side-column">
            <SectionCard title="Quick Add" aside={<span className="section-chip">Fast capture</span>}>
              <form className="quick-form" onSubmit={addManualTask}>
                <input
                  placeholder="Task or topic"
                  value={form.title}
                  onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                />
                <input
                  placeholder="Category"
                  value={form.category}
                  onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
                />
                <button className="button button-primary" type="submit">
                  Add item
                </button>
              </form>
            </SectionCard>

            <SectionCard title="Game Layer" aside={<span className="section-chip">Momentum</span>}>
              <div className="game-grid">
                <MiniStat label="Coins" value={state.game.coins} />
                <MiniStat label="Reviews today" value={`${state.game.daily.reviews}/5`} />
                <MiniStat label="Solves today" value={`${state.game.daily.solves}/2`} />
                <MiniStat label="Total reviews" value={state.game.totalReviews} />
              </div>
              <div className="challenge-box">
                <p>Challenge board</p>
                <strong>{challenge}</strong>
              </div>
            </SectionCard>

            <SectionCard
              title="Achievements"
              aside={<span className="section-chip">{state.game.unlocked.length} unlocked</span>}
            >
              <div className="achievement-list">
                {Object.entries(achievementMap).map(([key, label]) => {
                  const unlocked = state.game.unlocked.includes(key);
                  return (
                    <div className={`achievement-item ${unlocked ? "is-unlocked" : ""}`} key={key}>
                      <span>{unlocked ? "Unlocked" : "Locked"}</span>
                      <strong>{label}</strong>
                    </div>
                  );
                })}
              </div>
            </SectionCard>

            <SectionCard title="Reminder Log" aside={<span className="section-chip">Recent</span>}>
              <div className="log-list">
                {state.reminders.length ? (
                  state.reminders.map((entry) => <div key={entry}>{entry}</div>)
                ) : (
                  <EmptyState text="No reminders yet. Once you start reviewing, your timeline will show up here." />
                )}
              </div>
            </SectionCard>
          </aside>
        </section>

        <section className="arena-panel">
          <div className="arena-header">
            <div>
              <p className="eyebrow">Blind 75 Arena</p>
              <h2>Build your interview deck visually</h2>
            </div>
            <div className="arena-actions">
              <button className="button button-secondary" onClick={loadBlindDeck}>
                Load all into tracker
              </button>
            </div>
          </div>

          <div className="filters-row">
            <input
              placeholder="Search questions"
              value={filters.search}
              onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
            />
            <select
              value={filters.category}
              onChange={(event) => setFilters((current) => ({ ...current, category: event.target.value }))}
            >
              {blindCategories.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
            <select
              value={filters.difficulty}
              onChange={(event) => setFilters((current) => ({ ...current, difficulty: event.target.value }))}
            >
              {["All difficulty", "Easy", "Medium", "Hard"].map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </div>

          <div className="deck-banner">
            <div>
              <span>Daily deck</span>
              <strong>{state.game.dailyDeck.length} cards selected</strong>
            </div>
            <p>Use this as your focused interview sprint queue.</p>
          </div>

          <div className="blind-grid">
            {filteredBlind.map((item) => {
              const inTracker = state.items.some((entry) => entry.blindId === item.id);
              const solved = state.game.solvedBlind.includes(item.id);
              const inDeck = state.game.dailyDeck.includes(item.id);
              const href =
                item.premium && state.settings.preferAltLinks ? item.alt : item.link;
              return (
                <article
                  className={`blind-card difficulty-${item.difficulty.toLowerCase()} ${solved ? "is-solved" : ""}`}
                  key={item.id}
                >
                  <div className="blind-card-top">
                    <span>{item.category}</span>
                    <span>{item.difficulty}</span>
                  </div>
                  <h3>
                    <a href={href} target="_blank" rel="noreferrer">
                      {item.title}
                    </a>
                  </h3>
                  <p>{solved ? "Captured" : inTracker ? "Tracked in your workspace" : "Ready to add"}</p>
                  <div className="blind-actions">
                    <button className="button button-ghost" disabled={inTracker} onClick={() => addBlindItem(item)}>
                      {inTracker ? "In tracker" : "Add"}
                    </button>
                    <button className="button button-ghost" onClick={() => toggleDailyDeck(item.id)}>
                      {inDeck ? "Remove deck" : "Add deck"}
                    </button>
                    <button className="button button-primary" disabled={solved} onClick={() => toggleSolved(item.id)}>
                      {solved ? "Solved" : "Solved +20XP"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}

function ensureDailyState(sourceState) {
  const current = structuredClone(sourceState || defaultState);
  const today = dayKey(new Date());
  if (current.game.daily.date === today) return current;
  if (!current.game.daily.date) {
    current.game.daily = { date: today, reviews: 0, solves: 0 };
    return current;
  }

  const previous = new Date(`${current.game.daily.date}T00:00:00`);
  const expected = dayKey(new Date(previous.getTime() + 86400000));
  current.game.streak = expected === today ? current.game.streak + 1 : 1;
  current.game.daily = { date: today, reviews: 0, solves: 0 };
  return current;
}

function MetricCard({ label, value, note }) {
  return (
    <article className="metric-card glass">
      <span>{label}</span>
      <strong>{value}</strong>
      <p>{note}</p>
    </article>
  );
}

function SectionCard({ title, aside, children }) {
  return (
    <section className="section-card glass">
      <div className="section-head">
        <h2>{title}</h2>
        {aside}
      </div>
      {children}
    </section>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="mini-stat">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function EmptyState({ text }) {
  return <p className="empty-state">{text}</p>;
}

export default App;
