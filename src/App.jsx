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

const ritualTones = [
  {
    id: "ember",
    name: "Ember Hall",
    accent: "gold",
    copy: "Warm light, decisive pace, finish the queue cleanly.",
  },
  {
    id: "aurora",
    name: "Aurora Deck",
    accent: "mint",
    copy: "Breathy neon focus with softer momentum and smoother transitions.",
  },
  {
    id: "atlas",
    name: "Atlas Grid",
    accent: "blue",
    copy: "Structured, analytical, and built for long study sessions.",
  },
];

function App() {
  const [state, setState] = useState(() => ensureDailyState(loadState()));
  const [status, setStatus] = useState("Focus studio is ready.");
  const [ritualLine, setRitualLine] = useState("Choose a deck and begin a smooth review ritual.");
  const [itemForm, setItemForm] = useState({ title: "", category: "" });
  const [deckForm, setDeckForm] = useState({ name: "", description: "" });
  const [filters, setFilters] = useState({
    search: "",
    category: "All categories",
    difficulty: "All difficulty",
  });
  const [sparkles, setSparkles] = useState([]);
  const [session, setSession] = useState({
    open: false,
    deckId: "",
    queue: [],
    index: 0,
    step: "idle",
    reviewed: [],
    lastQuality: null,
    startedAt: 0,
  });
  const fileRef = useRef(null);
  const audioRef = useRef(null);

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
      pushReminder(`Ritual ready: ${next.title}`, `${due.length} cards are waiting in your queue.`);
    }, minutes * 60 * 1000);
    return () => window.clearInterval(timer);
  }, [state.items, state.settings.reminderMinutes, state.settings.notifications]);

  const dueItems = useMemo(
    () =>
      state.items
        .filter(isDue)
        .sort((left, right) => new Date(left.srs.nextReview).getTime() - new Date(right.srs.nextReview).getTime()),
    [state.items],
  );

  const completedCount = useMemo(
    () => state.items.filter((item) => /done|complete/i.test(item.status)).length,
    [state.items],
  );

  const openItems = useMemo(
    () => state.items.filter((item) => !/done|complete/i.test(item.status)),
    [state.items],
  );

  const overdueItems = useMemo(
    () =>
      state.items.filter((item) => {
        if (!item.dueDate) return false;
        const value = new Date(item.dueDate).getTime();
        return !Number.isNaN(value) && value < Date.now();
      }),
    [state.items],
  );

  const solvedCount = state.game.solvedBlind.length;
  const trackedBlindItems = useMemo(() => state.items.filter((item) => item.source === "blind75"), [state.items]);
  const customDecks = Array.isArray(state.decks) ? state.decks : [];
  const selectedDeckId = state.settings.activeDeckId || "system:due";
  const selectedTone = state.settings.ritualTone || "ember";

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

  const smartDecks = useMemo(
    () => buildSystemDecks({ dueItems, overdueItems, openItems, trackedBlindItems, state }),
    [dueItems, overdueItems, openItems, trackedBlindItems, state],
  );

  const allDecks = useMemo(
    () => [...smartDecks, ...customDecks.map((deck) => hydrateCustomDeck(deck, state.items))],
    [smartDecks, customDecks, state.items],
  );

  const activeDeck = allDecks.find((deck) => deck.id === selectedDeckId) || allDecks[0];
  const activeDeckItems = useMemo(
    () => resolveDeckItems(activeDeck, state.items),
    [activeDeck, state.items],
  );

  const focusScore = Math.min(
    98,
    Math.round(
      (dueItems.length ? 42 : 72) +
        Math.min(18, state.game.streak * 2.5) +
        Math.min(18, (completedCount / Math.max(1, state.items.length)) * 22),
    ),
  );

  const levelFloor = (state.game.level - 1) * 120;
  const levelGoal = state.game.level * 120;
  const levelProgress = Math.max(
    0,
    Math.min(100, Math.round(((state.game.xp - levelFloor) / (levelGoal - levelFloor)) * 100)),
  );

  const selectedCustomDeck =
    customDecks.find((deck) => deck.id === state.settings.selectedCustomDeckId) || customDecks[0] || null;

  const currentSessionItem = session.open ? session.queue[session.index] || null : null;
  const sessionProgress = session.queue.length
    ? Math.round(((session.index + (session.step === "complete" ? 1 : 0)) / session.queue.length) * 100)
    : 0;

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

  function launchSparkles(tone = "mint", amount = 12) {
    const burst = Array.from({ length: amount }, (_, index) => ({
      id: `${tone}-${Date.now()}-${index}`,
      left: 12 + Math.random() * 76,
      delay: Math.random() * 140,
      duration: 1200 + Math.random() * 1200,
      tone,
    }));
    setSparkles((current) => [...current, ...burst]);
    window.setTimeout(() => {
      setSparkles((current) => current.filter((piece) => !burst.some((added) => added.id === piece.id)));
    }, 2600);
  }

  function ensureAudio() {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    if (!audioRef.current) audioRef.current = new AudioCtx();
    if (audioRef.current.state === "suspended") audioRef.current.resume();
    return audioRef.current;
  }

  function playTone(kind = "soft") {
    if (!state.settings.soundEnabled) return;
    const ctx = ensureAudio();
    if (!ctx) return;

    const presets = {
      soft: [392, 523],
      pulse: [392, 587, 659],
      resolve: [523, 659, 784],
    };

    const notes = presets[kind] || presets.soft;
    notes.forEach((frequency, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = frequency;
      osc.connect(gain);
      gain.connect(ctx.destination);
      const start = ctx.currentTime + index * 0.08;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.03, start + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.28);
      osc.start(start);
      osc.stop(start + 0.3);
    });
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
    launchSparkles(flare, 10);
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
    if (!itemForm.title.trim()) return;
    const item = createManualItem(itemForm);

    setState((current) => {
      const next = {
        ...current,
        items: [item, ...current.items],
      };
      if (selectedCustomDeck) {
        next.decks = current.decks.map((deck) =>
          deck.id === selectedCustomDeck.id && !deck.itemIds.includes(item.id)
            ? { ...deck, itemIds: [item.id, ...deck.itemIds] }
            : deck,
        );
      }
      return next;
    });

    setItemForm({ title: "", category: "" });
    awardXp(8, "Quick add", "pink");
    setStatus(`Added ${item.title}.`);
  }

  function reviewItem(itemId, quality, reason = "Review") {
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
    playTone(quality >= 4 ? "resolve" : "soft");
    awardXp({ 1: 2, 3: 6, 4: 10, 5: 14 }[quality] || 5, `${reason}: ${qualityLabel(quality)}`, "mint");
  }

  function completeItem(itemId) {
    setState((current) => ({
      ...current,
      items: current.items.map((item) =>
        item.id === itemId ? { ...item, status: "completed" } : item,
      ),
    }));
    playTone("pulse");
    awardXp(12, "Task completed", "gold");
  }

  function addTrackedItemToDeck(deckId, itemId) {
    setState((current) => ({
      ...current,
      decks: current.decks.map((deck) =>
        deck.id === deckId && !deck.itemIds.includes(itemId)
          ? { ...deck, itemIds: [itemId, ...deck.itemIds] }
          : deck,
      ),
    }));
    setStatus("Card added to custom deck.");
  }

  function removeTrackedItemFromDeck(deckId, itemId) {
    setState((current) => ({
      ...current,
      decks: current.decks.map((deck) =>
        deck.id === deckId
          ? { ...deck, itemIds: deck.itemIds.filter((entry) => entry !== itemId) }
          : deck,
      ),
    }));
  }

  function createDeck(event) {
    event.preventDefault();
    if (!deckForm.name.trim()) return;
    const tone = ritualTones[(customDecks.length + 1) % ritualTones.length];
    const deck = {
      id: createId("deck"),
      name: deckForm.name.trim(),
      description: deckForm.description.trim() || "A custom ritual stack.",
      itemIds: [],
      tone: tone.id,
      createdAt: new Date().toISOString(),
    };
    setState((current) => ({
      ...current,
      decks: [deck, ...(current.decks || [])],
      settings: {
        ...current.settings,
        selectedCustomDeckId: deck.id,
        activeDeckId: deck.id,
      },
    }));
    setDeckForm({ name: "", description: "" });
    setStatus(`Created deck "${deck.name}".`);
    launchSparkles(tone.accent, 14);
  }

  function removeDeck(deckId) {
    setState((current) => ({
      ...current,
      decks: current.decks.filter((deck) => deck.id !== deckId),
      settings: {
        ...current.settings,
        selectedCustomDeckId:
          current.settings.selectedCustomDeckId === deckId ? "" : current.settings.selectedCustomDeckId,
        activeDeckId: current.settings.activeDeckId === deckId ? "system:due" : current.settings.activeDeckId,
      },
    }));
    setStatus("Deck archived.");
  }

  function selectDeck(deckId) {
    updateSettings({ activeDeckId: deckId });
    const deck = allDecks.find((entry) => entry.id === deckId);
    if (deck?.kind === "custom") {
      updateSettings({ selectedCustomDeckId: deck.id });
    }
    setRitualLine(deck ? deck.copy : "Choose a deck and begin a ritual.");
  }

  function addBlindItem(item, deckId = "") {
    setState((current) => {
      const existingTracked = current.items.find((entry) => entry.blindId === item.id);
      const trackedId = existingTracked?.id || createId("blind");
      const nextItems = existingTracked
        ? current.items
        : [
            {
              id: trackedId,
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
          ];

      const nextDecks = deckId
        ? current.decks.map((deck) =>
            deck.id === deckId && !deck.itemIds.includes(trackedId)
              ? { ...deck, itemIds: [trackedId, ...deck.itemIds] }
              : deck,
          )
        : current.decks;

      return {
        ...current,
        items: nextItems,
        decks: nextDecks,
      };
    });
    playTone("soft");
    awardXp(6, deckId ? "Blind card routed to deck" : "Blind card added", "blue");
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
    playTone("resolve");
    awardXp(20, "Problem solved", "pink");
  }

  function startSession(deck) {
    const queue = resolveDeckItems(deck, state.items).filter((item) => !/done|complete/i.test(item.status));
    if (!queue.length) {
      setStatus("This deck is empty right now. Add cards or pick another ritual.");
      return;
    }

    setSession({
      open: true,
      deckId: deck.id,
      queue,
      index: 0,
      step: "live",
      reviewed: [],
      lastQuality: null,
      startedAt: Date.now(),
    });
    setRitualLine(`Entering ${deck.name}. ${deck.copy}`);
    playTone("pulse");
  }

  function closeSession() {
    setSession({
      open: false,
      deckId: "",
      queue: [],
      index: 0,
      step: "idle",
      reviewed: [],
      lastQuality: null,
      startedAt: 0,
    });
  }

  function answerSession(quality) {
    const currentItem = session.queue[session.index];
    if (!currentItem) return;
    reviewItem(currentItem.id, quality, "Ritual");

    const reviewed = [...session.reviewed, { id: currentItem.id, quality }];
    const hasNext = session.index < session.queue.length - 1;
    setSession((current) => ({
      ...current,
      step: hasNext ? "transition" : "complete",
      reviewed,
      lastQuality: quality,
    }));

    if (hasNext) {
      window.setTimeout(() => {
        setSession((current) => ({
          ...current,
          index: current.index + 1,
          step: "live",
        }));
      }, 320);
    } else {
      launchSparkles("gold", 20);
      setStatus("Ritual complete.");
    }
  }

  function rollChallenge() {
    const pool = [
      ...dueItems.slice(0, 8).map((item) => `Review "${item.title}" with full attention.`),
      ...overdueItems.slice(0, 5).map((item) => `Recover "${item.title}" before it slips further.`),
      ...blindItems
        .filter((item) => !state.game.solvedBlind.includes(item.id))
        .slice(0, 12)
        .map((item) => `Bring "${item.title}" into a custom deck and solve it.`),
    ];
    setRitualLine(
      pool.length
        ? pool[Math.floor(Math.random() * pool.length)]
        : "Everything is under control. Curate a fresh custom deck for tomorrow.",
    );
  }

  const heroTone = ritualTones.find((tone) => tone.id === selectedTone) || ritualTones[0];

  return (
    <div className={`page-shell tone-${heroTone.id}`}>
      <div className="orb orb-a" />
      <div className="orb orb-b" />
      <div className="orb orb-c" />
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

      {session.open ? (
        <FocusSessionOverlay
          deck={allDecks.find((deck) => deck.id === session.deckId)}
          session={session}
          currentItem={currentSessionItem}
          progress={sessionProgress}
          onClose={closeSession}
          onAnswer={answerSession}
        />
      ) : null}

      <main className="app-shell">
        <section className="cinema-hero">
          <div className="cinema-copy">
            <p className="eyebrow">Premium Focus Trainer</p>
            <h1>Ritual decks for deep work and cleaner recall.</h1>
            <p className="hero-text">
              Build smart decks, create custom rituals, and review inside an immersive trainer that
              feels smooth, intentional, and calm.
            </p>
            <div className="hero-actions">
              <button className="button button-primary" onClick={() => startSession(activeDeck)}>
                Begin ritual
              </button>
              <button className="button button-secondary" onClick={rollChallenge}>
                Inspire me
              </button>
            </div>
            <div className="ritual-strip">
              <span className="ritual-line">{ritualLine}</span>
              <span className="status-pill">{status}</span>
            </div>
          </div>

          <div className="cinema-stage">
            <div className="focus-orbit">
              <div className="focus-ring ring-one" />
              <div className="focus-ring ring-two" />
              <div className="focus-core">
                <span>Live deck</span>
                <strong>{activeDeck?.name || "Due ritual"}</strong>
                <p>{activeDeck?.count || 0} cards loaded</p>
              </div>
            </div>
            <div className="stage-panel glass">
              <div className="stage-head">
                <span>Focus score</span>
                <strong>{focusScore}</strong>
              </div>
              <div className="stage-grid">
                <MetricCell label="Due now" value={dueItems.length} />
                <MetricCell label="Streak" value={`${state.game.streak}d`} />
                <MetricCell label="Level" value={state.game.level} />
                <MetricCell label="Solved" value={`${solvedCount}/75`} />
              </div>
              <div className="progress-wrap">
                <div className="progress-caption">
                  <span>Level progress</span>
                  <span>{state.game.xp} XP</span>
                </div>
                <div className="progress-track">
                  <span style={{ width: `${levelProgress}%` }} />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="studio-grid">
          <div className="column-main">
            <StudioCard
              title="Deck Atelier"
              subtitle="Smart decks for now, custom decks for how you want to work."
              action={<span className="section-chip">{allDecks.length} decks</span>}
            >
              <div className="tone-switcher">
                {ritualTones.map((tone) => (
                  <button
                    key={tone.id}
                    className={`tone-pill ${selectedTone === tone.id ? "is-active" : ""}`}
                    onClick={() => updateSettings({ ritualTone: tone.id })}
                  >
                    <strong>{tone.name}</strong>
                    <span>{tone.copy}</span>
                  </button>
                ))}
              </div>

              <div className="deck-shelf">
                {allDecks.map((deck) => (
                  <button
                    key={deck.id}
                    className={`deck-card deck-${deck.tone || "ember"} ${selectedDeckId === deck.id ? "is-selected" : ""}`}
                    onClick={() => selectDeck(deck.id)}
                  >
                    <div className="deck-card-head">
                      <span>{deck.kind === "custom" ? "Custom deck" : "Smart deck"}</span>
                      <span>{deck.count} cards</span>
                    </div>
                    <strong>{deck.name}</strong>
                    <p>{deck.description}</p>
                    <div className="deck-card-foot">
                      <span>{deck.copy}</span>
                    </div>
                  </button>
                ))}
              </div>

              <div className="atelier-grid">
                <form className="deck-builder" onSubmit={createDeck}>
                  <div className="subhead">
                    <h3>Create Custom Deck</h3>
                    <span>{selectedCustomDeck ? `Editing shelf: ${selectedCustomDeck.name}` : "Start a new shelf"}</span>
                  </div>
                  <input
                    placeholder="Deck name"
                    value={deckForm.name}
                    onChange={(event) => setDeckForm((current) => ({ ...current, name: event.target.value }))}
                  />
                  <textarea
                    rows="3"
                    placeholder="Short mood or intent for this ritual"
                    value={deckForm.description}
                    onChange={(event) =>
                      setDeckForm((current) => ({ ...current, description: event.target.value }))
                    }
                  />
                  <button className="button button-primary" type="submit">
                    Create deck
                  </button>
                </form>

                <div className="deck-manager">
                  <div className="subhead">
                    <h3>Custom Shelf</h3>
                    <span>{customDecks.length} saved</span>
                  </div>
                  <div className="custom-deck-list">
                    {customDecks.length ? (
                      customDecks.map((deck) => {
                        const hydrated = hydrateCustomDeck(deck, state.items);
                        const isEditing = selectedCustomDeck?.id === deck.id;
                        return (
                          <article className={`custom-deck-row ${isEditing ? "is-editing" : ""}`} key={deck.id}>
                            <button className="custom-deck-main" onClick={() => selectDeck(deck.id)}>
                              <strong>{deck.name}</strong>
                              <span>{hydrated.count} cards • {deck.description}</span>
                            </button>
                            <div className="custom-deck-actions">
                              <button
                                className="button button-ghost"
                                onClick={() => updateSettings({ selectedCustomDeckId: deck.id, activeDeckId: deck.id })}
                              >
                                Edit
                              </button>
                              <button className="button button-ghost" onClick={() => removeDeck(deck.id)}>
                                Archive
                              </button>
                            </div>
                          </article>
                        );
                      })
                    ) : (
                      <EmptyState text="No custom decks yet. Build one for interview prep, writing, or a daily ritual." />
                    )}
                  </div>
                </div>
              </div>
            </StudioCard>

            <StudioCard
              title="Ritual Queue"
              subtitle="A calmer preview of what the selected deck will feel like."
              action={
                <div className="queue-actions">
                  <span className="section-chip">{activeDeckItems.length} cards</span>
                  <button className="button button-primary" onClick={() => startSession(activeDeck)}>
                    Start session
                  </button>
                </div>
              }
            >
              <div className="queue-preview">
                {activeDeckItems.length ? (
                  activeDeckItems.slice(0, 4).map((item, index) => (
                    <article className="ritual-card" key={item.id}>
                      <div className="ritual-card-head">
                        <span>Card {String(index + 1).padStart(2, "0")}</span>
                        <span>{item.category}</span>
                      </div>
                      <strong>{item.title}</strong>
                      <p>
                        {item.dueDate ? `${formatRelative(item.dueDate)} deadline` : `Next review ${formatDate(item.srs.nextReview)}`}
                      </p>
                    </article>
                  ))
                ) : (
                  <EmptyState text="This deck is empty. Add cards from the library below or switch to another deck." />
                )}
              </div>
            </StudioCard>

            <StudioCard
              title="Tracked Library"
              subtitle="All captured work cards. Route them into your custom decks."
              action={<span className="section-chip">{state.items.length} tracked cards</span>}
            >
              <div className="quick-add-panel">
                <form className="quick-form wide" onSubmit={addManualTask}>
                  <input
                    placeholder="Task or topic"
                    value={itemForm.title}
                    onChange={(event) => setItemForm((current) => ({ ...current, title: event.target.value }))}
                  />
                  <input
                    placeholder="Category"
                    value={itemForm.category}
                    onChange={(event) => setItemForm((current) => ({ ...current, category: event.target.value }))}
                  />
                  <button className="button button-primary" type="submit">
                    Add card
                  </button>
                </form>
              </div>

              <div className="library-grid">
                {state.items.length ? (
                  state.items.slice(0, 18).map((item) => {
                    const done = /done|complete/i.test(item.status);
                    const inSelectedDeck = selectedCustomDeck?.itemIds.includes(item.id);
                    return (
                      <article className={`library-card ${done ? "is-complete" : ""}`} key={item.id}>
                        <div className="library-card-head">
                          <span>{item.category}</span>
                          <span>{item.source}</span>
                        </div>
                        <strong>{item.title}</strong>
                        <p>
                          {item.dueDate ? formatRelative(item.dueDate) : `Next review ${formatDate(item.srs.nextReview)}`}
                        </p>
                        <div className="library-card-actions">
                          {!done ? (
                            <button className="button button-ghost" onClick={() => completeItem(item.id)}>
                              Complete
                            </button>
                          ) : null}
                          {selectedCustomDeck ? (
                            inSelectedDeck ? (
                              <button
                                className="button button-ghost"
                                onClick={() => removeTrackedItemFromDeck(selectedCustomDeck.id, item.id)}
                              >
                                Remove from {selectedCustomDeck.name}
                              </button>
                            ) : (
                              <button
                                className="button button-ghost"
                                onClick={() => addTrackedItemToDeck(selectedCustomDeck.id, item.id)}
                              >
                                Add to {selectedCustomDeck.name}
                              </button>
                            )
                          ) : null}
                        </div>
                      </article>
                    );
                  })
                ) : (
                  <EmptyState text="No tracked cards yet. Sync a sheet, import CSV, or add a manual card to begin." />
                )}
              </div>
            </StudioCard>
          </div>

          <aside className="column-side">
            <StudioCard
              title="Control Deck"
              subtitle="Inputs, sync, reminders, and ambient trainer settings."
              action={<span className="section-chip">Live setup</span>}
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

              <div className="action-stack">
                <button className="button button-primary" onClick={() => syncFromSheet(false)}>
                  Sync from sheet
                </button>
                <button className="button button-secondary" onClick={() => fileRef.current?.click()}>
                  Import CSV
                </button>
                <button className="button button-ghost" onClick={enableNotifications}>
                  Enable notifications
                </button>
                <label className="toggle-row">
                  <input
                    type="checkbox"
                    checked={state.settings.preferAltLinks}
                    onChange={(event) => updateSettings({ preferAltLinks: event.target.checked })}
                  />
                  Prefer alternate links for premium Blind cards
                </label>
                <label className="toggle-row">
                  <input
                    type="checkbox"
                    checked={state.settings.soundEnabled !== false}
                    onChange={(event) => updateSettings({ soundEnabled: event.target.checked })}
                  />
                  Ritual chimes and completion tones
                </label>
                <input ref={fileRef} type="file" accept=".csv,text/csv" hidden onChange={importCsv} />
              </div>
            </StudioCard>

            <StudioCard
              title="Momentum"
              subtitle="A softer, more ceremonial progress layer."
              action={<span className="section-chip">{state.game.unlocked.length} unlocked</span>}
            >
              <div className="momentum-panel">
                <div className="momentum-meter">
                  <span>Level {state.game.level}</span>
                  <strong>{state.game.xp} XP</strong>
                  <div className="progress-track">
                    <span style={{ width: `${levelProgress}%` }} />
                  </div>
                </div>
                <div className="momentum-grid">
                  <MetricCell label="Coins" value={state.game.coins} />
                  <MetricCell label="Today reviews" value={`${state.game.daily.reviews}/5`} />
                  <MetricCell label="Today solves" value={`${state.game.daily.solves}/2`} />
                  <MetricCell label="Overdue" value={overdueItems.length} />
                </div>
              </div>
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
            </StudioCard>

            <StudioCard
              title="Blind Card Library"
              subtitle="Curate practice decks the same way you curate work rituals."
              action={<span className="section-chip">{filteredBlind.length} visible</span>}
            >
              <div className="filters-column">
                <input
                  placeholder="Search prompts"
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

              <div className="blind-library">
                {filteredBlind.slice(0, 12).map((item) => {
                  const tracked = state.items.some((entry) => entry.blindId === item.id);
                  const solved = state.game.solvedBlind.includes(item.id);
                  const href = item.premium && state.settings.preferAltLinks ? item.alt : item.link;
                  return (
                    <article className={`blind-library-card ${solved ? "is-solved" : ""}`} key={item.id}>
                      <div className="blind-card-top">
                        <span>{item.category}</span>
                        <span>{item.difficulty}</span>
                      </div>
                      <strong>
                        <a href={href} target="_blank" rel="noreferrer">
                          {item.title}
                        </a>
                      </strong>
                      <p>{solved ? "Solved and logged." : tracked ? "Tracked in your library." : "Ready to route."}</p>
                      <div className="blind-actions">
                        <button className="button button-ghost" onClick={() => addBlindItem(item)}>
                          {tracked ? "Track again" : "Track card"}
                        </button>
                        {selectedCustomDeck ? (
                          <button className="button button-ghost" onClick={() => addBlindItem(item, selectedCustomDeck.id)}>
                            Add to {selectedCustomDeck.name}
                          </button>
                        ) : null}
                        <button className="button button-primary" disabled={solved} onClick={() => toggleSolved(item.id)}>
                          {solved ? "Solved" : "Mark solved"}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </StudioCard>

            <StudioCard
              title="Session Log"
              subtitle="Recent wins, reminders, and ritual echoes."
              action={<span className="section-chip">Recent</span>}
            >
              <div className="log-list">
                {state.reminders.length ? (
                  state.reminders.map((entry) => <div key={entry}>{entry}</div>)
                ) : (
                  <EmptyState text="Nothing logged yet. Once you start using rituals, your session history appears here." />
                )}
              </div>
            </StudioCard>
          </aside>
        </section>
      </main>
    </div>
  );
}

function buildSystemDecks({ dueItems, overdueItems, openItems, trackedBlindItems }) {
  return [
    {
      id: "system:due",
      kind: "system",
      name: "Due Ritual",
      description: "Everything that needs recall right now.",
      copy: "Best for short, clean review sweeps.",
      tone: "ember",
      itemIds: dueItems.map((item) => item.id),
      count: dueItems.length,
    },
    {
      id: "system:overdue",
      kind: "system",
      name: "Recovery Deck",
      description: "Cards with slipping deadlines and neglected momentum.",
      copy: "Use this when you want to recover shape quickly.",
      tone: "atlas",
      itemIds: overdueItems.map((item) => item.id),
      count: overdueItems.length,
    },
    {
      id: "system:flow",
      kind: "system",
      name: "Flow Stack",
      description: "Open work cards, lightly sorted for a productive pass.",
      copy: "A balanced deck for calm progress sessions.",
      tone: "aurora",
      itemIds: openItems.map((item) => item.id),
      count: openItems.length,
    },
    {
      id: "system:blind",
      kind: "system",
      name: "Blind Practice",
      description: "All tracked interview cards in one smooth practice deck.",
      copy: "Great for coding ritual sessions.",
      tone: "atlas",
      itemIds: trackedBlindItems.map((item) => item.id),
      count: trackedBlindItems.length,
    },
  ];
}

function hydrateCustomDeck(deck, items) {
  const count = deck.itemIds.filter((itemId) => items.some((item) => item.id === itemId)).length;
  return {
    ...deck,
    kind: "custom",
    copy: deck.description || "A custom ritual stack.",
    count,
  };
}

function resolveDeckItems(deck, items) {
  if (!deck) return [];
  const byId = new Map(items.map((item) => [item.id, item]));
  return (deck.itemIds || []).map((itemId) => byId.get(itemId)).filter(Boolean);
}

function ensureDailyState(sourceState) {
  const current = structuredClone(sourceState || defaultState);
  const today = dayKey(new Date());
  if (current.game.daily.date === today) return current;
  if (!current.game.daily.date) {
    current.game.daily = { date: today, reviews: 0, solves: 0 };
    current.game.streak = Math.max(current.game.streak, 1);
    return current;
  }

  const previous = new Date(`${current.game.daily.date}T00:00:00`);
  const expected = dayKey(new Date(previous.getTime() + 86400000));
  current.game.streak = expected === today ? current.game.streak + 1 : 1;
  current.game.daily = { date: today, reviews: 0, solves: 0 };
  return current;
}

function StudioCard({ title, subtitle, action, children }) {
  return (
    <section className="studio-card glass">
      <div className="studio-head">
        <div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function MetricCell({ label, value }) {
  return (
    <div className="metric-cell">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function FocusSessionOverlay({ deck, session, currentItem, progress, onClose, onAnswer }) {
  const elapsedSeconds = Math.max(0, Math.round((Date.now() - session.startedAt) / 1000));

  return (
    <div className="session-overlay">
      <div className="session-backdrop" onClick={onClose} />
      <div className={`session-shell ${session.step === "transition" ? "is-transitioning" : ""}`}>
        <div className="session-topbar">
          <div>
            <span className="eyebrow">Focus Session</span>
            <h2>{deck?.name || "Ritual"}</h2>
          </div>
          <button className="button button-ghost" onClick={onClose}>
            Exit ritual
          </button>
        </div>

        <div className="session-progress">
          <div className="progress-caption">
            <span>
              Card {Math.min(session.index + 1, session.queue.length)} of {session.queue.length}
            </span>
            <span>{elapsedSeconds}s elapsed</span>
          </div>
          <div className="progress-track">
            <span style={{ width: `${progress}%` }} />
          </div>
        </div>

        {session.step === "complete" ? (
          <div className="session-complete">
            <p className="eyebrow">Session Complete</p>
            <h3>Clean run. The ritual is closed.</h3>
            <p>
              You reviewed {session.reviewed.length} cards in {Math.max(1, elapsedSeconds)} seconds.
            </p>
            <button className="button button-primary" onClick={onClose}>
              Return to studio
            </button>
          </div>
        ) : currentItem ? (
          <div className="session-stage">
            <article className="session-card">
              <div className="session-card-head">
                <span>{currentItem.category}</span>
                <span>{currentItem.source}</span>
              </div>
              <strong>{currentItem.title}</strong>
              <p>
                {currentItem.dueDate
                  ? `Deadline ${formatDate(currentItem.dueDate)}`
                  : `Next review ${formatDate(currentItem.srs.nextReview)}`}
              </p>
            </article>

            <div className="session-actions">
              {[1, 3, 4, 5].map((quality) => (
                <button
                  key={quality}
                  className={`session-answer answer-${quality}`}
                  onClick={() => onAnswer(quality)}
                >
                  <span>{qualityLabel(quality)}</span>
                  <strong>{quality === 1 ? "Reset" : quality === 3 ? "Strain" : quality === 4 ? "Solid" : "Fluent"}</strong>
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function EmptyState({ text }) {
  return <p className="empty-state">{text}</p>;
}

export default App;
