import { describe, expect, it } from "vitest";
import { loadState, STORAGE_KEY } from "./storage";

describe("storage", () => {
  it("hydrates starter content for fresh installs", () => {
    localStorage.removeItem(STORAGE_KEY);

    const state = loadState();

    expect(state.items.length).toBeGreaterThan(0);
    expect(state.decks.length).toBeGreaterThan(0);
    expect(state.settings.activeDeckId).toBe("starter-deck-rhythm");
    expect(state.settings.selectedCustomDeckId).toBe("starter-deck-rhythm");
  });

  it("preserves saved values while still hydrating nested defaults", () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        settings: { themeMode: "dawn" },
        items: [],
        decks: [],
        game: { history: { "2026-03-14": { reviews: 3 } } },
      }),
    );

    const state = loadState();

    expect(state.settings.themeMode).toBe("dawn");
    expect(state.settings.soundPack).toBe("studio");
    expect(state.game.history["2026-03-14"].reviews).toBe(3);
  });
});
