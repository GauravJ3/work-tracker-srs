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

const ritualThemes = [
  { id: "sun", name: "Sun Deck", accent: "gold", copy: "Warm, decisive, and excellent for your daily ritual." },
  { id: "wave", name: "Wave Deck", accent: "blue", copy: "Cool, breathable, and ideal for longer study loops." },
  { id: "forest", name: "Forest Deck", accent: "mint", copy: "Calm, restorative, and better for recovery passes." },
];

const views = [
  ["home", "Sanctuary"],
  ["decks", "Deck Garden"],
  ["library", "Archive"],
  ["settings", "Observatory"],
];

function App() {
  const [state, setState] = useState(() => ensureDailyState(loadState()));
  const [view, setView] = useState("home");
  const [status, setStatus] = useState("Studio ready.");
  const [ritualHint, setRitualHint] = useState("Start with one deck and let the rest of the workspace stay quiet.");
  const [itemForm, setItemForm] = useState({ title: "", category: "" });
  const [deckForm, setDeckForm] = useState({ name: "", description: "" });
  const [filters, setFilters] = useState({
    search: "",
    category: "All categories",
    difficulty: "All difficulty",
  });
  const [libraryMode, setLibraryMode] = useState("work");
  const [sparkles, setSparkles] = useState([]);
  const [session, setSession] = useState({
    open: false,
    deckId: "",
    queue: [],
    index: 0,
    step: "idle",
    reviewed: [],
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
      pushReminder(`Ready to review ${next.title}`, `${due.length} cards are waiting for you.`);
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
  const overdueItems = useMemo(
    () =>
      state.items.filter((item) => {
        if (!item.dueDate) return false;
        const value = new Date(item.dueDate).getTime();
        return !Number.isNaN(value) && value < Date.now();
      }),
    [state.items],
  );
  const openItems = useMemo(
    () => state.items.filter((item) => !/done|complete/i.test(item.status)),
    [state.items],
  );
  const completedCount = useMemo(
    () => state.items.filter((item) => /done|complete/i.test(item.status)).length,
    [state.items],
  );
  const trackedBlindItems = useMemo(() => state.items.filter((item) => item.source === "blind75"), [state.items]);
  const customDecks = Array.isArray(state.decks) ? state.decks : [];
  const activeDeckId = state.settings.activeDeckId || "system:today";
  const activeThemeId = state.settings.ritualTone || "sun";
  const currentTheme = ritualThemes.find((theme) => theme.id === activeThemeId) || ritualThemes[0];

  const smartDecks = useMemo(
    () => [
      {
        id: "system:today",
        kind: "system",
        name: "Today Ritual",
        description: "Your due reviews, sorted for the cleanest starting point.",
        copy: "Start here when you want the app to decide what matters.",
        tone: "sun",
        itemIds: dueItems.map((item) => item.id),
        count: dueItems.length,
      },
      {
        id: "system:recover",
        kind: "system",
        name: "Recovery Run",
        description: "Late cards and slipping deadlines in one rescue deck.",
        copy: "Best when you want to stabilize the week quickly.",
        tone: "forest",
        itemIds: overdueItems.map((item) => item.id),
        count: overdueItems.length,
      },
      {
        id: "system:flow",
        kind: "system",
        name: "Flow Stack",
        description: "Open cards with room for a calm, productive pass.",
        copy: "Good for low-pressure work sessions.",
        tone: "wave",
        itemIds: openItems.map((item) => item.id),
        count: openItems.length,
      },
      {
        id: "system:blind",
        kind: "system",
        name: "Blind Trainer",
        description: "Tracked coding prompts gathered into one training deck.",
        copy: "Useful for interview prep and spaced coding review.",
        tone: "wave",
        itemIds: trackedBlindItems.map((item) => item.id),
        count: trackedBlindItems.length,
      },
    ],
    [dueItems, overdueItems, openItems, trackedBlindItems],
  );

  const allDecks = useMemo(
    () => [...smartDecks, ...customDecks.map((deck) => hydrateCustomDeck(deck, state.items))],
    [smartDecks, customDecks, state.items],
  );
  const activeDeck = allDecks.find((deck) => deck.id === activeDeckId) || allDecks[0];
  const activeDeckItems = useMemo(() => resolveDeckItems(activeDeck, state.items), [activeDeck, state.items]);
  const selectedCustomDeck =
    customDecks.find((deck) => deck.id === state.settings.selectedCustomDeckId) || customDecks[0] || null;
  const solvedCount = state.game.solvedBlind.length;
  const focusScore = Math.min(
    99,
    Math.round(
      (dueItems.length ? 48 : 78) +
        Math.min(10, state.game.streak * 2) +
        Math.min(10, completedCount),
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

  const currentSessionItem = session.open ? session.queue[session.index] || null : null;
  const sessionProgress = session.queue.length
    ? Math.round(((session.index + (session.step === "complete" ? 1 : 0)) / session.queue.length) * 100)
    : 0;
  const homeCards = activeDeckItems.slice(0, 1);
  const portals = [
    {
      id: "decks",
      title: "Deck Garden",
      description: "Choose a ritual deck or grow a custom one.",
      stat: `${allDecks.length} decks`,
      tone: "sun",
    },
    {
      id: "library",
      title: "Archive",
      description: "Shape your cards and route them into the right path.",
      stat: `${state.items.length} cards`,
      tone: "wave",
    },
    {
      id: "settings",
      title: "Observatory",
      description: "Quiet controls for sync, sound, reminders, and mood.",
      stat: "Studio controls",
      tone: "forest",
    },
  ];

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

  function launchSparkles(tone = "mint", amount = 10) {
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
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = frequency;
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      const start = ctx.currentTime + index * 0.08;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.026, start + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.26);
      oscillator.start(start);
      oscillator.stop(start + 0.28);
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
      setState((current) => ({
        ...ensureAchievementDraft(current),
        items: mergeImportedItems(current.items, imported),
      }));
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
      return ensureAchievementDraft(
        ensureDailyState({
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
        }),
      );
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

  function createDeck(event) {
    event.preventDefault();
    if (!deckForm.name.trim()) return;
    const theme = ritualThemes[(customDecks.length + 1) % ritualThemes.length];
    const deck = {
      id: createId("deck"),
      name: deckForm.name.trim(),
      description: deckForm.description.trim() || "A custom trainer deck.",
      itemIds: [],
      tone: theme.id,
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
    setStatus(`Created ${deck.name}.`);
    launchSparkles(theme.accent, 14);
  }

  function removeDeck(deckId) {
    setState((current) => ({
      ...current,
      decks: current.decks.filter((deck) => deck.id !== deckId),
      settings: {
        ...current.settings,
        selectedCustomDeckId:
          current.settings.selectedCustomDeckId === deckId ? "" : current.settings.selectedCustomDeckId,
        activeDeckId: current.settings.activeDeckId === deckId ? "system:today" : current.settings.activeDeckId,
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
    setRitualHint(deck ? deck.copy : "Choose a deck and begin.");
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
    setStatus("Card added to deck.");
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

  function addBlindItem(item, deckId = "") {
    setState((current) => {
      const existing = current.items.find((entry) => entry.blindId === item.id);
      const trackedId = existing?.id || createId("blind");
      const items = existing
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
      const decks = deckId
        ? current.decks.map((deck) =>
            deck.id === deckId && !deck.itemIds.includes(trackedId)
              ? { ...deck, itemIds: [trackedId, ...deck.itemIds] }
              : deck,
          )
        : current.decks;
      return { ...current, items, decks };
    });
    awardXp(6, deckId ? "Blind card added to deck" : "Blind card tracked", "blue");
  }

  function toggleSolved(itemId) {
    setState((current) => {
      if (current.game.solvedBlind.includes(itemId)) return current;
      return ensureAchievementDraft(
        ensureDailyState({
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
        }),
      );
    });
    playTone("resolve");
    awardXp(20, "Problem solved", "pink");
  }

  function startSession(deck) {
    const queue = resolveDeckItems(deck, state.items).filter((item) => !/done|complete/i.test(item.status));
    if (!queue.length) {
      setStatus("This deck is empty right now.");
      return;
    }
    setSession({
      open: true,
      deckId: deck.id,
      queue,
      index: 0,
      step: "live",
      reviewed: [],
      startedAt: Date.now(),
    });
    setRitualHint(`Entering ${deck.name}. ${deck.copy}`);
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
      startedAt: 0,
    });
  }

  function answerSession(quality) {
    const item = session.queue[session.index];
    if (!item) return;
    reviewItem(item.id, quality, "Ritual");
    const reviewed = [...session.reviewed, { id: item.id, quality }];
    const hasNext = session.index < session.queue.length - 1;
    setSession((current) => ({
      ...current,
      reviewed,
      step: hasNext ? "transition" : "complete",
    }));
    if (hasNext) {
      window.setTimeout(() => {
        setSession((current) => ({
          ...current,
          index: current.index + 1,
          step: "live",
        }));
      }, 260);
    } else {
      launchSparkles("gold", 18);
      setStatus("Ritual complete.");
    }
  }

  function inspire() {
    const suggestions = [
      `Start with ${activeDeck?.name || "Today Ritual"} for the cleanest pass.`,
      dueItems.length ? `You have ${dueItems.length} due cards. A short ritual would clear them.` : "Your due queue is calm. This is a good time to build a deck.",
      selectedCustomDeck ? `Keep curating ${selectedCustomDeck.name} until it feels like your best session deck.` : "Create one custom deck for your highest-stakes work.",
    ];
    setRitualHint(suggestions[Math.floor(Math.random() * suggestions.length)]);
  }

  return (
    <div className={`page-shell theme-${currentTheme.id}`}>
      <div className="ambient ambient-a" />
      <div className="ambient ambient-b" />
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
          onAnswer={answerSession}
          onClose={closeSession}
        />
      ) : null}

      <main className="app-shell">
        <header className="top-shell">
          <div className="brand-block">
            <p className="eyebrow">Work Pulse Trainer</p>
            <h1>Enter a calmer world for work, memory, and training.</h1>
            <p className="brand-copy">
              A collectible-card workspace where each place has a purpose, each deck has a mood, and each ritual begins with one clear next step.
            </p>
          </div>
          <div className="hero-actions">
            <button className="button button-primary" type="button" onClick={() => startSession(activeDeck)}>
              Start {activeDeck?.name || "ritual"}
            </button>
            <button className="button button-secondary" type="button" onClick={inspire}>
              Inspire me
            </button>
          </div>
        </header>

        <section className="hero-panel">
          <article className="hero-focus panel">
            <div className="hero-focus-copy">
              <span className="hero-label">Sanctuary recommendation</span>
              <strong>{activeDeck?.name || "Today Ritual"}</strong>
              <p>{ritualHint}</p>
            </div>
            <div className="hero-metrics">
              <MetricBadge label="Focus" value={focusScore} />
              <MetricBadge label="Due" value={dueItems.length} />
              <MetricBadge label="Streak" value={`${state.game.streak}d`} />
            </div>
          </article>
          <article className="hero-card-preview trainer-card trainer-card-feature">
            <TrainerCardHeader tag="Active Deck" type={activeDeck?.kind === "custom" ? "Custom" : "Smart"} />
            <div className={`trainer-art art-${activeDeck?.tone || "sun"}`}>
              <div className="trainer-sigil">{deckSigil(activeDeck?.name || "TR")}</div>
            </div>
            <div className="trainer-name-row">
              <strong>{activeDeck?.name || "Today Ritual"}</strong>
              <span className="trainer-hp">{activeDeck?.count || 0} cards</span>
            </div>
            <div className="trainer-info">
              <div><span>Path</span><b>{activeDeck?.description || "Start with the cards due now."}</b></div>
              <div><span>Mode</span><b>{currentTheme.name}</b></div>
            </div>
          </article>
        </section>

        <nav className="view-nav" aria-label="Workspace views">
          {views.map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={`view-chip ${view === id ? "is-active" : ""}`}
              onClick={() => setView(id)}
            >
              {label}
            </button>
          ))}
        </nav>

        <section className="workspace">
          {view === "home" ? (
            <div className="screen-grid">
              <Panel
                title="Sanctuary"
                subtitle="Start here, choose one path, and let everything else stay quiet."
                action={<span className="section-chip">{activeDeck?.count || 0} cards in focus</span>}
              >
                <div className="world-intro">
                  <div className="world-story">
                    <p className="world-line">
                      Tonight&apos;s path leads through <strong>{activeDeck?.name || "Today Ritual"}</strong>. The queue is small enough to feel approachable and sharp enough to matter.
                    </p>
                    <div className="hero-actions">
                      <button className="button button-primary" type="button" onClick={() => startSession(activeDeck)}>
                        Enter ritual
                      </button>
                      <button className="button button-ghost" type="button" onClick={() => setView("decks")}>
                        Explore decks
                      </button>
                    </div>
                  </div>
                  <div className="portal-grid">
                    {portals.map((portal) => (
                      <button
                        key={portal.id}
                        type="button"
                        className={`portal-card portal-${portal.tone}`}
                        onClick={() => setView(portal.id)}
                      >
                        <span>{portal.stat}</span>
                        <strong>{portal.title}</strong>
                        <p>{portal.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="card-row">
                  {homeCards.length ? (
                    homeCards.map((item, index) => (
                      <TrainerCard
                        key={item.id}
                        item={item}
                        badge={index === 0 ? "Next Card" : `#${index + 1}`}
                        footer={
                          <button className="button button-ghost" type="button" onClick={() => startSession(activeDeck)}>
                            Review in session
                          </button>
                        }
                      />
                    ))
                  ) : (
                    <EmptyState text="No cards in this ritual yet. Choose another deck or add cards from Library." />
                  )}
                </div>
              </Panel>

              <Panel
                title="Campfire"
                subtitle="Just enough signal to keep your rhythm."
                action={<span className="section-chip">{state.game.unlocked.length} unlocked</span>}
              >
                <div className="metrics-strip">
                  <MetricBadge label="Level" value={state.game.level} />
                  <MetricBadge label="XP" value={state.game.xp} />
                  <MetricBadge label="Coins" value={state.game.coins} />
                  <MetricBadge label="Solved" value={`${solvedCount}/75`} />
                </div>
                <div className="progress-section">
                  <div className="progress-caption">
                    <span>Level progress</span>
                    <span>{levelProgress}%</span>
                  </div>
                  <div className="progress-track">
                    <span style={{ width: `${levelProgress}%` }} />
                  </div>
                </div>
              </Panel>
            </div>
          ) : null}

          {view === "decks" ? (
            <div className="screen-grid">
              <Panel
                title="Deck Garden"
                subtitle="Choose a ritual mood, then grow your own decks beside the smart ones."
                action={<span className="section-chip">{allDecks.length} total decks</span>}
              >
                <div className="theme-picker">
                  {ritualThemes.map((theme) => (
                    <button
                      key={theme.id}
                      type="button"
                      className={`theme-card ${activeThemeId === theme.id ? "is-active" : ""}`}
                      onClick={() => updateSettings({ ritualTone: theme.id })}
                    >
                      <strong>{theme.name}</strong>
                      <span>{theme.copy}</span>
                    </button>
                  ))}
                </div>
                <div className="card-row">
                  {allDecks.map((deck) => (
                    <button
                      key={deck.id}
                      type="button"
                      className={`trainer-card trainer-card-button ${activeDeckId === deck.id ? "is-selected" : ""}`}
                      onClick={() => selectDeck(deck.id)}
                    >
                      <TrainerCardHeader tag={deck.kind === "custom" ? "Custom Deck" : "Smart Deck"} type={deck.count} />
                      <div className={`trainer-art art-${deck.tone || "sun"}`}>
                        <div className="trainer-sigil">{deckSigil(deck.name)}</div>
                      </div>
                      <div className="trainer-name-row">
                        <strong>{deck.name}</strong>
                        <span className="trainer-hp">{deck.count} cards</span>
                      </div>
                      <div className="trainer-info">
                        <div><span>Feel</span><b>{deck.description}</b></div>
                        <div><span>Play</span><b>{deck.copy}</b></div>
                      </div>
                    </button>
                  ))}
                </div>
              </Panel>

              <Panel
                title="Forge A Deck"
                subtitle="Name a path, give it a feeling, and it becomes a place you can return to."
                action={<span className="section-chip">{customDecks.length} custom</span>}
              >
                <div className="two-column">
                  <form className="builder-form" onSubmit={createDeck}>
                    <input
                      placeholder="Deck name"
                      value={deckForm.name}
                      onChange={(event) => setDeckForm((current) => ({ ...current, name: event.target.value }))}
                    />
                    <textarea
                      rows="4"
                      placeholder="What is this deck for?"
                      value={deckForm.description}
                      onChange={(event) => setDeckForm((current) => ({ ...current, description: event.target.value }))}
                    />
                    <button className="button button-primary" type="submit">
                      Create deck
                    </button>
                  </form>
                  <div className="stack-list">
                    {customDecks.length ? (
                      customDecks.map((deck) => {
                        const hydrated = hydrateCustomDeck(deck, state.items);
                        const selected = selectedCustomDeck?.id === deck.id;
                        return (
                          <article className={`list-row ${selected ? "is-selected" : ""}`} key={deck.id}>
                            <button type="button" className="list-row-main" onClick={() => selectDeck(deck.id)}>
                              <strong>{deck.name}</strong>
                              <span>{hydrated.count} cards • {deck.description}</span>
                            </button>
                            <button className="button button-ghost" type="button" onClick={() => removeDeck(deck.id)}>
                              Archive
                            </button>
                          </article>
                        );
                      })
                    ) : (
                      <EmptyState text="No custom decks yet. Create one and then start routing cards into it." />
                    )}
                  </div>
                </div>
              </Panel>
            </div>
          ) : null}

          {view === "library" ? (
            <div className="screen-grid">
              <Panel
                title="Archive"
                subtitle="Browse, refine, and route cards into the right deck."
                action={<span className="section-chip">{state.items.length} cards</span>}
              >
                <div className="subview-switch">
                  <button
                    type="button"
                    className={`subview-chip ${libraryMode === "work" ? "is-active" : ""}`}
                    onClick={() => setLibraryMode("work")}
                  >
                    Work Cards
                  </button>
                  <button
                    type="button"
                    className={`subview-chip ${libraryMode === "blind" ? "is-active" : ""}`}
                    onClick={() => setLibraryMode("blind")}
                  >
                    Blind Cards
                  </button>
                </div>

                {libraryMode === "work" ? (
                  <>
                <form className="quick-add" onSubmit={addManualTask}>
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
                    <div className="card-row">
                      {state.items.slice(0, 16).map((item) => {
                        const done = /done|complete/i.test(item.status);
                        const inDeck = selectedCustomDeck?.itemIds.includes(item.id);
                        return (
                          <TrainerCard
                            key={item.id}
                            item={item}
                            badge={item.source}
                            footer={
                              <div className="card-actions">
                                {!done ? (
                                  <button className="button button-ghost" type="button" onClick={() => completeItem(item.id)}>
                                    Complete
                                  </button>
                                ) : null}
                                {selectedCustomDeck ? (
                                  inDeck ? (
                                    <button
                                      className="button button-ghost"
                                      type="button"
                                      onClick={() => removeTrackedItemFromDeck(selectedCustomDeck.id, item.id)}
                                    >
                                      Remove from deck
                                    </button>
                                  ) : (
                                    <button
                                      className="button button-ghost"
                                      type="button"
                                      onClick={() => addTrackedItemToDeck(selectedCustomDeck.id, item.id)}
                                    >
                                      Add to {selectedCustomDeck.name}
                                    </button>
                                  )
                                ) : null}
                              </div>
                            }
                          />
                        );
                      })}
                    </div>
                  </>
                ) : null}

                {libraryMode === "blind" ? (
                  <>
                <div className="panel-inline-head">
                  <span className="section-chip">{filteredBlind.length} matches</span>
                </div>
                <div className="quick-add quick-add-filters">
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
                <div className="card-row">
                  {filteredBlind.slice(0, 10).map((item) => {
                    const tracked = state.items.some((entry) => entry.blindId === item.id);
                    const solved = state.game.solvedBlind.includes(item.id);
                    const href = item.premium && state.settings.preferAltLinks ? item.alt : item.link;
                    return (
                      <article className="trainer-card" key={item.id}>
                        <TrainerCardHeader tag={item.category} type={item.difficulty} />
                        <div className={`trainer-art art-${difficultyTone(item.difficulty)}`}>
                          <div className="trainer-sigil">{deckSigil(item.title)}</div>
                        </div>
                        <div className="trainer-name-row">
                          <strong>
                            <a href={href} target="_blank" rel="noreferrer">
                              {item.title}
                            </a>
                          </strong>
                          <span className="trainer-hp">{solved ? "Solved" : tracked ? "Tracked" : "Wild"}</span>
                        </div>
                        <div className="trainer-info">
                          <div><span>Status</span><b>{solved ? "Captured in your trainer log." : "Ready to add to your ritual."}</b></div>
                        </div>
                        <div className="card-actions">
                          <button className="button button-ghost" type="button" onClick={() => addBlindItem(item)}>
                            {tracked ? "Track again" : "Track"}
                          </button>
                          {selectedCustomDeck ? (
                            <button className="button button-ghost" type="button" onClick={() => addBlindItem(item, selectedCustomDeck.id)}>
                              Add to deck
                            </button>
                          ) : null}
                          <button className="button button-primary" type="button" disabled={solved} onClick={() => toggleSolved(item.id)}>
                            {solved ? "Solved" : "Mark solved"}
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
                  </>
                ) : null}
              </Panel>
            </div>
          ) : null}

          {view === "settings" ? (
            <div className="screen-grid">
              <Panel
                title="Observatory"
                subtitle="Quiet controls for how this world sounds, syncs, and stays with you."
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
                      Sync from sheet
                    </button>
                    <button className="button button-secondary" type="button" onClick={() => fileRef.current?.click()}>
                      Import CSV
                    </button>
                    <button className="button button-ghost" type="button" onClick={enableNotifications}>
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
                    state.reminders.map((entry) => <div className="log-row" key={entry}>{entry}</div>)
                  ) : (
                    <EmptyState text="Nothing logged yet. Once you begin rituals, your recent session activity will appear here." />
                  )}
                </div>
              </Panel>
            </div>
          ) : null}
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
    current.game.streak = Math.max(current.game.streak, 1);
    return current;
  }
  const previous = new Date(`${current.game.daily.date}T00:00:00`);
  const expected = dayKey(new Date(previous.getTime() + 86400000));
  current.game.streak = expected === today ? current.game.streak + 1 : 1;
  current.game.daily = { date: today, reviews: 0, solves: 0 };
  return current;
}

function hydrateCustomDeck(deck, items) {
  const count = deck.itemIds.filter((itemId) => items.some((item) => item.id === itemId)).length;
  return {
    ...deck,
    kind: "custom",
    copy: deck.description || "A custom trainer deck.",
    count,
  };
}

function resolveDeckItems(deck, items) {
  if (!deck) return [];
  const byId = new Map(items.map((item) => [item.id, item]));
  return (deck.itemIds || []).map((itemId) => byId.get(itemId)).filter(Boolean);
}

function difficultyTone(difficulty) {
  if (difficulty === "Hard") return "sun";
  if (difficulty === "Medium") return "wave";
  return "forest";
}

function deckSigil(name) {
  const clean = String(name || "").replace(/[^a-zA-Z0-9 ]+/g, "").trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return clean.slice(0, 2).toUpperCase() || "WP";
}

function Panel({ title, subtitle, action, children }) {
  return (
    <section className="panel">
      <div className="panel-head">
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

function portalStat(type) {
  return type;
}

function MetricBadge({ label, value }) {
  return (
    <div className="metric-badge">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function TrainerCardHeader({ tag, type }) {
  return (
    <div className="trainer-header">
      <span>{tag}</span>
      <span>{type}</span>
    </div>
  );
}

function TrainerCard({ item, badge, footer }) {
  return (
    <article className="trainer-card">
      <TrainerCardHeader tag={item.category} type={badge} />
      <div className={`trainer-art art-${difficultyTone(item.difficulty || "Medium")}`}>
        <div className="trainer-sigil">{deckSigil(item.title)}</div>
      </div>
      <div className="trainer-name-row">
        <strong>{item.title}</strong>
        <span className="trainer-hp">{item.dueDate ? formatRelative(item.dueDate) : formatDate(item.srs.nextReview)}</span>
      </div>
      <div className="trainer-info">
        <div><span>Status</span><b>{item.status}</b></div>
        <div><span>Recall</span><b>{item.srs.interval} day interval</b></div>
      </div>
      {footer ? <div className="trainer-footer">{footer}</div> : null}
    </article>
  );
}

function FocusSessionOverlay({ deck, session, currentItem, progress, onAnswer, onClose }) {
  const elapsed = Math.max(1, Math.round((Date.now() - session.startedAt) / 1000));

  return (
    <div className="session-overlay">
      <div className="session-backdrop" onClick={onClose} />
      <div className={`session-shell ${session.step === "transition" ? "is-transitioning" : ""}`}>
        <div className="session-topbar">
          <div>
            <p className="eyebrow">Ritual Session</p>
            <h2>{deck?.name || "Session"}</h2>
          </div>
          <button className="button button-ghost" type="button" onClick={onClose}>
            Leave ritual
          </button>
        </div>

        <div className="progress-caption">
          <span>
            Card {Math.min(session.index + 1, session.queue.length)} of {session.queue.length}
          </span>
          <span>{elapsed}s</span>
        </div>
        <div className="progress-track">
          <span style={{ width: `${progress}%` }} />
        </div>

        {session.step === "complete" ? (
          <div className="session-complete">
            <p className="eyebrow">Ritual Complete</p>
            <h3>You cleared {session.reviewed.length} cards.</h3>
            <p>Return to the studio when you want the next deck.</p>
            <button className="button button-primary" type="button" onClick={onClose}>
              Return to studio
            </button>
          </div>
        ) : currentItem ? (
          <>
            <div className="session-card-frame">
              <TrainerCard item={currentItem} badge={`Card ${session.index + 1}`} />
            </div>
            <div className="session-actions">
              {[1, 3, 4, 5].map((quality) => (
                <button
                  key={quality}
                  type="button"
                  className={`session-answer answer-${quality}`}
                  onClick={() => onAnswer(quality)}
                >
                  <span>{qualityLabel(quality)}</span>
                  <strong>
                    {quality === 1 ? "Reset" : quality === 3 ? "Tough" : quality === 4 ? "Good" : "Easy"}
                  </strong>
                </button>
              ))}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

function EmptyState({ text }) {
  return <p className="empty-state">{text}</p>;
}

export default App;
