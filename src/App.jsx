import { useEffect, useMemo, useRef, useState } from "react";
import { Play, Sparkles } from "lucide-react";
import SanctuaryScreen from "./components/screens/SanctuaryScreen";
import DeckGardenScreen from "./components/screens/DeckGardenScreen";
import ArchiveScreen from "./components/screens/ArchiveScreen";
import ObservatoryScreen from "./components/screens/ObservatoryScreen";
import RitualChamber from "./components/session/RitualChamber";
import MetricBadge from "./components/shared/MetricBadge";
import TrainerCardHeader from "./components/cards/TrainerCardHeader";
import { getDeckIcon, getScreenIcon } from "./components/shared/worldIcons";
import { deckSigil } from "./components/cards/TrainerCard";
import { blindItems } from "./data/blind75";
import { createManualItem, mergeImportedItems, parseCsv, rowsToItems } from "./lib/importers";
import { fetchSheetRows } from "./lib/sheets";
import { applySrsReview, createDefaultSrs, isDue } from "./lib/srs";
import { defaultState, loadState, saveState } from "./lib/storage";
import { clampNumber, createId, dayKey, normalize } from "./lib/utils";

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
    Math.round((dueItems.length ? 48 : 78) + Math.min(10, state.game.streak * 2) + Math.min(10, completedCount)),
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
      const matchesCategory = filters.category === "All categories" || item.category === filters.category;
      const matchesDifficulty = filters.difficulty === "All difficulty" || item.difficulty === filters.difficulty;
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
  const HeroDeckIcon = getDeckIcon(activeDeck?.name);

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
    awardXp({ 1: 2, 3: 6, 4: 10, 5: 14 }[quality] || 5, `${reason}: ${quality <= 1 ? "Again" : quality === 3 ? "Hard" : quality === 4 ? "Good" : "Easy"}`, "mint");
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
    if (deck?.kind === "custom") updateSettings({ selectedCustomDeckId: deck.id });
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
      dueItems.length
        ? `You have ${dueItems.length} due cards. A short ritual would clear them.`
        : "Your due queue is calm. This is a good time to build a deck.",
      selectedCustomDeck
        ? `Keep curating ${selectedCustomDeck.name} until it feels like your best session deck.`
        : "Create one custom deck for your highest-stakes work.",
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
        <RitualChamber
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
              <Play size={16} />
              Start {activeDeck?.name || "ritual"}
            </button>
            <button className="button button-secondary" type="button" onClick={inspire}>
              <Sparkles size={16} />
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
              <span className="trainer-art-icon" aria-hidden="true">
                <HeroDeckIcon size={18} />
              </span>
            </div>
            <div className="trainer-name-row">
              <strong>
                <span className="trainer-name-icon" aria-hidden="true">
                  <HeroDeckIcon size={16} />
                </span>
                {activeDeck?.name || "Today Ritual"}
              </strong>
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
            (() => {
              const ViewIcon = getScreenIcon(label);
              return (
                <button
                  key={id}
                  type="button"
                  className={`view-chip ${view === id ? "is-active" : ""}`}
                  onClick={() => setView(id)}
                >
                  <ViewIcon size={15} />
                  {label}
                </button>
              );
            })()
          ))}
        </nav>

        <section className="workspace">
          {view === "home" ? (
            <SanctuaryScreen
              activeDeck={activeDeck}
              activeDeckItems={activeDeckItems}
              homeCards={homeCards}
              portals={portals}
              setView={setView}
              startSession={startSession}
              state={state}
              solvedCount={solvedCount}
              levelProgress={levelProgress}
              ritualHint={ritualHint}
              focusScore={focusScore}
            />
          ) : null}

          {view === "decks" ? (
            <DeckGardenScreen
              ritualThemes={ritualThemes}
              activeThemeId={activeThemeId}
              updateSettings={updateSettings}
              allDecks={allDecks}
              activeDeckId={activeDeckId}
              selectDeck={selectDeck}
              deckForm={deckForm}
              setDeckForm={setDeckForm}
              createDeck={createDeck}
              customDecks={customDecks}
              hydrateCustomDeck={hydrateCustomDeck}
              state={state}
              selectedCustomDeck={selectedCustomDeck}
              removeDeck={removeDeck}
            />
          ) : null}

          {view === "library" ? (
            <ArchiveScreen
              state={state}
              itemForm={itemForm}
              setItemForm={setItemForm}
              addManualTask={addManualTask}
              selectedCustomDeck={selectedCustomDeck}
              removeTrackedItemFromDeck={removeTrackedItemFromDeck}
              addTrackedItemToDeck={addTrackedItemToDeck}
              completeItem={completeItem}
              libraryMode={libraryMode}
              setLibraryMode={setLibraryMode}
              filters={filters}
              setFilters={setFilters}
              blindCategories={blindCategories}
              filteredBlind={filteredBlind}
              addBlindItem={addBlindItem}
              toggleSolved={toggleSolved}
            />
          ) : null}

          {view === "settings" ? (
            <ObservatoryScreen
              state={state}
              updateSettings={updateSettings}
              clampNumber={clampNumber}
              syncFromSheet={syncFromSheet}
              fileRef={fileRef}
              importCsv={importCsv}
              enableNotifications={enableNotifications}
            />
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

export { hydrateCustomDeck, resolveDeckItems };
export default App;
