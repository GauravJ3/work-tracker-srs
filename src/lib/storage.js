import { createDefaultSrs } from "./srs";

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
    ritualTone: "ember",
    soundEnabled: true,
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
  },
};

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
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw);
    return {
      ...defaultState,
      ...parsed,
      settings: { ...defaultState.settings, ...(parsed.settings || {}) },
      decks: Array.isArray(parsed.decks) ? parsed.decks : [],
      game: {
        ...defaultState.game,
        ...(parsed.game || {}),
        daily: { ...defaultState.game.daily, ...(parsed.game?.daily || {}) },
      },
      items: Array.isArray(parsed.items) ? parsed.items.map(hydrateItem) : [],
      reminders: Array.isArray(parsed.reminders) ? parsed.reminders : [],
    };
  } catch {
    return defaultState;
  }
}

export function saveState(value) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
}
