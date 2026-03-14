import { createDefaultSrs } from "./srs";

function createStarterItems() {
  const now = Date.now();

  return [
    {
      id: "starter-focus-brief",
      title: "Write today focus brief",
      category: "Planning",
      status: "open",
      source: "starter",
      notes: "Pick one main outcome before opening the rest of your tools.",
      dueDate: "",
      srs: {
        ...createDefaultSrs(),
        nextReview: new Date(now - 3600000).toISOString(),
      },
    },
    {
      id: "starter-follow-up-loop",
      title: "Review follow-ups before noon",
      category: "Work",
      status: "open",
      source: "starter",
      notes: "Clear small pending replies before they become drag.",
      dueDate: "",
      srs: {
        ...createDefaultSrs(),
        nextReview: new Date(now - 7200000).toISOString(),
      },
    },
    {
      id: "starter-system-design",
      title: "Revise one system design concept",
      category: "Study",
      status: "open",
      source: "starter",
      notes: "Keep one interview concept warm each week.",
      dueDate: "",
      srs: {
        ...createDefaultSrs(),
        nextReview: new Date(now + 86400000).toISOString(),
      },
    },
    {
      id: "starter-retro",
      title: "Capture one lesson from the day",
      category: "Reflection",
      status: "open",
      source: "starter",
      notes: "A short retrospective makes tomorrow easier.",
      dueDate: "",
      srs: {
        ...createDefaultSrs(),
        nextReview: new Date(now + 172800000).toISOString(),
      },
    },
    {
      id: "starter-dsa-pattern",
      title: "Review one DSA pattern",
      category: "Interview",
      status: "open",
      source: "starter",
      notes: "Keep one pattern fresh instead of revisiting everything at once.",
      dueDate: "",
      srs: {
        ...createDefaultSrs(),
        nextReview: new Date(now - 1800000).toISOString(),
      },
    },
    {
      id: "starter-deep-work-reset",
      title: "Plan a 45-minute deep work block",
      category: "Deep Work",
      status: "open",
      source: "starter",
      notes: "Protect one meaningful block before the day gets noisy.",
      dueDate: "",
      srs: {
        ...createDefaultSrs(),
        nextReview: new Date(now + 43200000).toISOString(),
      },
    },
  ];
}

function createStarterDecks() {
  return [
    {
      id: "starter-deck-interview",
      name: "Interview Core",
      description: "Starter prompts for keeping interview prep warm.",
      itemIds: ["starter-system-design", "starter-dsa-pattern"],
      tone: "wave",
      createdAt: new Date().toISOString(),
    },
    {
      id: "starter-deck-rhythm",
      name: "Work Rhythm",
      description: "Starter cards for planning, follow-ups, and reflection.",
      itemIds: ["starter-focus-brief", "starter-follow-up-loop", "starter-retro", "starter-deep-work-reset"],
      tone: "forest",
      createdAt: new Date().toISOString(),
    },
  ];
}

function createStarterContent() {
  return {
    items: createStarterItems(),
    decks: createStarterDecks(),
  };
}

export { createStarterContent };
