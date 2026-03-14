import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => {
  cleanup();
  localStorage.clear();
  document.documentElement.removeAttribute("data-theme");
});

if (!globalThis.matchMedia) {
  globalThis.matchMedia = vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

if (!globalThis.ResizeObserver) {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

if (!globalThis.Notification) {
  globalThis.Notification = class {
    static permission = "granted";

    static requestPermission() {
      return Promise.resolve("granted");
    }

    constructor() {}
  };
}

if (!globalThis.AudioContext) {
  globalThis.AudioContext = class {
    constructor() {
      this.currentTime = 0;
      this.destination = {};
      this.state = "running";
    }

    resume() {
      return Promise.resolve();
    }

    createOscillator() {
      return {
        type: "sine",
        frequency: { value: 0 },
        connect() {},
        start() {},
        stop() {},
      };
    }

    createGain() {
      return {
        connect() {},
        gain: {
          setValueAtTime() {},
          exponentialRampToValueAtTime() {},
        },
      };
    }
  };
}

if (!globalThis.webkitAudioContext) {
  globalThis.webkitAudioContext = globalThis.AudioContext;
}
