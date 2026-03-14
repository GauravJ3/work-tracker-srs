import { createDefaultSrs } from "./srs";
import { createStarterContent } from "./starters";

export const STORAGE_KEY = "work-pulse-v3";

export const defaultState = {
  items: [],
  reminders: [],
  settings: {
    sheetUrl: "",
    refreshMinutes: 30,
    reminderMinutes: 20,
    notifications: false,
    preferAltLinks: false,
    themeMode: "night",
    ritualTone: "sun",
    soundEnabled: true,
    soundPack: "studio",
    activeDeckId: "system:today",
    selectedCustomDeckId: "",
  },
  decks: [],
  game: {
    xp: 0,
    level: 1,
    coins: 0,
    streak: 0,
    totalReviews: 0,
    solvedBlind: [],
    dailyDeck: [],
    unlocked: [],
    daily: { date: "", reviews: 0, solves: 0 },
    history: {},
  },
};

function withStarterContent(baseState) {
  if (baseState.items?.length || baseState.decks?.length) return baseState;
  const starters = createStarterContent();
  return {
    ...baseState,
    items: starters.items,
    decks: starters.decks,
    settings: {
      ...baseState.settings,
      activeDeckId: "starter-deck-rhythm",
      selectedCustomDeckId: "starter-deck-rhythm",
    },
  };
}

function hydrateItem(item) {
  return {
    ...item,
    srs: {
      ...createDefaultSrs(),
      ...(item?.srs || {}),
    },
  };
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return withStarterContent(defaultState);
    const parsed = JSON.parse(raw);
    return withStarterContent({
      ...defaultState,
      ...parsed,
      settings: { ...defaultState.settings, ...(parsed.settings || {}) },
      decks: Array.isArray(parsed.decks) ? parsed.decks : [],
      game: {
        ...defaultState.game,
        ...(parsed.game || {}),
        daily: { ...defaultState.game.daily, ...(parsed.game?.daily || {}) },
        history:
          parsed.game?.history && typeof parsed.game.history === "object" && !Array.isArray(parsed.game.history)
            ? parsed.game.history
            : {},
      },
      items: Array.isArray(parsed.items) ? parsed.items.map(hydrateItem) : [],
      reminders: Array.isArray(parsed.reminders) ? parsed.reminders : [],
    });
  } catch {
    return withStarterContent(defaultState);
  }
}

export function saveState(value) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
}
