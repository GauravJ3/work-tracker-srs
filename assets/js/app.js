const STORAGE_KEY = "work-pulse-v2";

const BLIND_75 = [
  ["Two Sum", "Array", "Easy"],
  ["Best Time to Buy and Sell Stock", "Array", "Easy"],
  ["Contains Duplicate", "Array", "Easy"],
  ["Product of Array Except Self", "Array", "Medium"],
  ["Maximum Subarray", "Array", "Medium"],
  ["Maximum Product Subarray", "Array", "Medium"],
  ["Find Minimum in Rotated Sorted Array", "Array", "Medium"],
  ["Search in Rotated Sorted Array", "Array", "Medium"],
  ["3Sum", "Array", "Medium"],
  ["Container With Most Water", "Array", "Medium"],
  ["Sum of Two Integers", "Bit Manipulation", "Medium"],
  ["Number of 1 Bits", "Bit Manipulation", "Easy"],
  ["Counting Bits", "Bit Manipulation", "Easy"],
  ["Missing Number", "Bit Manipulation", "Easy"],
  ["Reverse Bits", "Bit Manipulation", "Easy"],
  ["Climbing Stairs", "Dynamic Programming", "Easy"],
  ["Coin Change", "Dynamic Programming", "Medium"],
  ["Longest Increasing Subsequence", "Dynamic Programming", "Medium"],
  ["Longest Common Subsequence", "Dynamic Programming", "Medium"],
  ["Word Break", "Dynamic Programming", "Medium"],
  ["House Robber", "Dynamic Programming", "Medium"],
  ["House Robber II", "Dynamic Programming", "Medium"],
  ["Decode Ways", "Dynamic Programming", "Medium"],
  ["Unique Paths", "Dynamic Programming", "Medium"],
  ["Jump Game", "Dynamic Programming", "Medium"],
  ["Clone Graph", "Graph", "Medium"],
  ["Course Schedule", "Graph", "Medium"],
  ["Pacific Atlantic Water Flow", "Graph", "Medium"],
  ["Number of Islands", "Graph", "Medium"],
  ["Longest Consecutive Sequence", "Graph", "Medium"],
  ["Number of Connected Components in an Undirected Graph", "Graph", "Medium"],
  ["Alien Dictionary", "Graph", "Hard"],
  ["Word Ladder", "Graph", "Hard"],
  ["Insert Interval", "Interval", "Medium"],
  ["Merge Intervals", "Interval", "Medium"],
  ["Non-overlapping Intervals", "Interval", "Medium"],
  ["Meeting Rooms II", "Interval", "Medium"],
  ["Minimum Interval to Include Each Query", "Interval", "Hard"],
  ["Reverse Linked List", "Linked List", "Easy"],
  ["Linked List Cycle", "Linked List", "Easy"],
  ["Merge Two Sorted Lists", "Linked List", "Easy"],
  ["Merge k Sorted Lists", "Linked List", "Hard"],
  ["Remove Nth Node From End of List", "Linked List", "Medium"],
  ["Reorder List", "Linked List", "Medium"],
  ["Set Matrix Zeroes", "Matrix", "Medium"],
  ["Spiral Matrix", "Matrix", "Medium"],
  ["Rotate Image", "Matrix", "Medium"],
  ["Word Search", "Matrix", "Medium"],
  ["Longest Substring Without Repeating Characters", "String", "Medium"],
  ["Longest Repeating Character Replacement", "String", "Medium"],
  ["Minimum Window Substring", "String", "Hard"],
  ["Valid Anagram", "String", "Easy"],
  ["Group Anagrams", "String", "Medium"],
  ["Valid Parentheses", "String", "Easy"],
  ["Valid Palindrome", "String", "Easy"],
  ["Longest Palindromic Substring", "String", "Medium"],
  ["Palindromic Substrings", "String", "Medium"],
  ["Implement Trie (Prefix Tree)", "String", "Medium"],
  ["Maximum Depth of Binary Tree", "Tree", "Easy"],
  ["Same Tree", "Tree", "Easy"],
  ["Invert Binary Tree", "Tree", "Easy"],
  ["Binary Tree Maximum Path Sum", "Tree", "Hard"],
  ["Binary Tree Level Order Traversal", "Tree", "Medium"],
  ["Serialize and Deserialize Binary Tree", "Tree", "Hard"],
  ["Subtree of Another Tree", "Tree", "Easy"],
  ["Construct Binary Tree from Preorder and Inorder Traversal", "Tree", "Medium"],
  ["Validate Binary Search Tree", "Tree", "Medium"],
  ["Kth Smallest Element in a BST", "Tree", "Medium"],
  ["Lowest Common Ancestor of a BST", "Tree", "Medium"],
  ["Lowest Common Ancestor of a Binary Tree", "Tree", "Medium"],
  ["Top K Frequent Elements", "Heap", "Medium"],
  ["Find Median from Data Stream", "Heap", "Hard"],
  ["Combination Sum", "Backtracking", "Medium"],
  ["Word Search II", "Backtracking", "Hard"],
  ["Subsets", "Backtracking", "Medium"],
];

const VERIFIED_PROBLEM_META = {
  "Two Sum": { slug: "two-sum" },
  "Best Time to Buy and Sell Stock": { slug: "best-time-to-buy-and-sell-stock" },
  "Contains Duplicate": { slug: "contains-duplicate" },
  "Product of Array Except Self": { slug: "product-of-array-except-self" },
  "Maximum Subarray": { slug: "maximum-subarray" },
  "Maximum Product Subarray": { slug: "maximum-product-subarray" },
  "Find Minimum in Rotated Sorted Array": { slug: "find-minimum-in-rotated-sorted-array" },
  "Search in Rotated Sorted Array": { slug: "search-in-rotated-sorted-array" },
  "3Sum": { slug: "3sum" },
  "Container With Most Water": { slug: "container-with-most-water" },
  "Sum of Two Integers": { slug: "sum-of-two-integers" },
  "Number of 1 Bits": { slug: "number-of-1-bits" },
  "Counting Bits": { slug: "counting-bits" },
  "Missing Number": { slug: "missing-number" },
  "Reverse Bits": { slug: "reverse-bits" },
  "Climbing Stairs": { slug: "climbing-stairs" },
  "Coin Change": { slug: "coin-change" },
  "Longest Increasing Subsequence": { slug: "longest-increasing-subsequence" },
  "Longest Common Subsequence": { slug: "longest-common-subsequence" },
  "Word Break": { slug: "word-break" },
  "House Robber": { slug: "house-robber" },
  "House Robber II": { slug: "house-robber-ii" },
  "Decode Ways": { slug: "decode-ways" },
  "Unique Paths": { slug: "unique-paths" },
  "Jump Game": { slug: "jump-game" },
  "Clone Graph": { slug: "clone-graph" },
  "Course Schedule": { slug: "course-schedule" },
  "Pacific Atlantic Water Flow": { slug: "pacific-atlantic-water-flow" },
  "Number of Islands": { slug: "number-of-islands" },
  "Longest Consecutive Sequence": { slug: "longest-consecutive-sequence" },
  "Number of Connected Components in an Undirected Graph": {
    slug: "number-of-connected-components-in-an-undirected-graph",
    premium: true,
    alt: "https://www.lintcode.com/problem/365/",
  },
  "Alien Dictionary": {
    slug: "alien-dictionary",
    premium: true,
    alt: "https://www.lintcode.com/problem/892/",
  },
  "Word Ladder": { slug: "word-ladder" },
  "Insert Interval": { slug: "insert-interval" },
  "Merge Intervals": { slug: "merge-intervals" },
  "Non-overlapping Intervals": { slug: "non-overlapping-intervals" },
  "Meeting Rooms II": {
    slug: "meeting-rooms-ii",
    premium: true,
    alt: "https://neetcode.io/problems/meeting-schedule-ii",
  },
  "Minimum Interval to Include Each Query": { slug: "minimum-interval-to-include-each-query" },
  "Reverse Linked List": { slug: "reverse-linked-list" },
  "Linked List Cycle": { slug: "linked-list-cycle" },
  "Merge Two Sorted Lists": { slug: "merge-two-sorted-lists" },
  "Merge k Sorted Lists": { slug: "merge-k-sorted-lists" },
  "Remove Nth Node From End of List": { slug: "remove-nth-node-from-end-of-list" },
  "Reorder List": { slug: "reorder-list" },
  "Set Matrix Zeroes": { slug: "set-matrix-zeroes" },
  "Spiral Matrix": { slug: "spiral-matrix" },
  "Rotate Image": { slug: "rotate-image" },
  "Word Search": { slug: "word-search" },
  "Longest Substring Without Repeating Characters": { slug: "longest-substring-without-repeating-characters" },
  "Longest Repeating Character Replacement": { slug: "longest-repeating-character-replacement" },
  "Minimum Window Substring": { slug: "minimum-window-substring" },
  "Valid Anagram": { slug: "valid-anagram" },
  "Group Anagrams": { slug: "group-anagrams" },
  "Valid Parentheses": { slug: "valid-parentheses" },
  "Valid Palindrome": { slug: "valid-palindrome" },
  "Longest Palindromic Substring": { slug: "longest-palindromic-substring" },
  "Palindromic Substrings": { slug: "palindromic-substrings" },
  "Implement Trie (Prefix Tree)": { slug: "implement-trie-prefix-tree" },
  "Maximum Depth of Binary Tree": { slug: "maximum-depth-of-binary-tree" },
  "Same Tree": { slug: "same-tree" },
  "Invert Binary Tree": { slug: "invert-binary-tree" },
  "Binary Tree Maximum Path Sum": { slug: "binary-tree-maximum-path-sum" },
  "Binary Tree Level Order Traversal": { slug: "binary-tree-level-order-traversal" },
  "Serialize and Deserialize Binary Tree": { slug: "serialize-and-deserialize-binary-tree" },
  "Subtree of Another Tree": { slug: "subtree-of-another-tree" },
  "Construct Binary Tree from Preorder and Inorder Traversal": {
    slug: "construct-binary-tree-from-preorder-and-inorder-traversal",
  },
  "Validate Binary Search Tree": { slug: "validate-binary-search-tree" },
  "Kth Smallest Element in a BST": { slug: "kth-smallest-element-in-a-bst" },
  "Lowest Common Ancestor of a BST": { slug: "lowest-common-ancestor-of-a-binary-search-tree" },
  "Lowest Common Ancestor of a Binary Tree": { slug: "lowest-common-ancestor-of-a-binary-tree" },
  "Top K Frequent Elements": { slug: "top-k-frequent-elements" },
  "Find Median from Data Stream": { slug: "find-median-from-data-stream" },
  "Combination Sum": { slug: "combination-sum" },
  "Word Search II": { slug: "word-search-ii" },
  Subsets: { slug: "subsets" },
};

const BLIND_ITEMS = BLIND_75.map(([title, category, difficulty], i) => ({
  id: `b75-${i + 1}`,
  title,
  category,
  difficulty,
  ...getProblemMeta(title),
}));

function getProblemMeta(title) {
  const info = VERIFIED_PROBLEM_META[title] || {};
  const slug = info.slug || toLeetCodeSlug(title);
  const link = `https://leetcode.com/problems/${slug}/`;
  const premium = Boolean(info.premium);
  const alt = info.alt || `https://www.google.com/search?q=${encodeURIComponent(`${title} problem alternative`)}`;
  return { link, alt, premium };
}

function toLeetCodeSlug(title) {
  return String(title)
    .toLowerCase()
    .replaceAll("&", "and")
    .replace(/\([^)]*\)/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const state = {
  items: [],
  reminders: [],
  settings: {
    sheetUrl: "",
    refreshMinutes: 30,
    reminderMinutes: 20,
    notifications: false,
    preferAltLinks: false,
    themeMode: "dark",
    layoutMode: "default",
    soundEnabled: true,
    confettiEnabled: true,
    ambientEnabled: false,
  },
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

const els = {
  sheetUrl: document.getElementById("sheetUrl"),
  refreshMinutes: document.getElementById("refreshMinutes"),
  reminderMinutes: document.getElementById("reminderMinutes"),
  syncBtn: document.getElementById("syncBtn"),
  requestNotifBtn: document.getElementById("requestNotifBtn"),
  testNotifBtn: document.getElementById("testNotifBtn"),
  csvFileInput: document.getElementById("csvFileInput"),
  preferAltLinks: document.getElementById("preferAltLinks"),
  themeMode: document.getElementById("themeMode"),
  layoutMode: document.getElementById("layoutMode"),
  soundEnabled: document.getElementById("soundEnabled"),
  confettiEnabled: document.getElementById("confettiEnabled"),
  ambientEnabled: document.getElementById("ambientEnabled"),
  confettiLayer: document.getElementById("confettiLayer"),
  animeScene: document.querySelector(".anime-scene"),
  syncStatus: document.getElementById("syncStatus"),
  dueList: document.getElementById("dueList"),
  allItems: document.getElementById("allItems"),
  dueCount: document.getElementById("dueCount"),
  totalCount: document.getElementById("totalCount"),
  statsGrid: document.getElementById("statsGrid"),
  reminderLog: document.getElementById("reminderLog"),
  addForm: document.getElementById("addForm"),
  newTitle: document.getElementById("newTitle"),
  newCategory: document.getElementById("newCategory"),
  gameHud: document.getElementById("gameHud"),
  challengeBtn: document.getElementById("challengeBtn"),
  challengeText: document.getElementById("challengeText"),
  achievementList: document.getElementById("achievementList"),
  achievementCount: document.getElementById("achievementCount"),
  blindList: document.getElementById("blindList"),
  blindCount: document.getElementById("blindCount"),
  b75Search: document.getElementById("b75Search"),
  b75Category: document.getElementById("b75Category"),
  b75Difficulty: document.getElementById("b75Difficulty"),
  loadBlindSetBtn: document.getElementById("loadBlindSetBtn"),
  clearDeckBtn: document.getElementById("clearDeckBtn"),
  dailyDeckDrop: document.getElementById("dailyDeckDrop"),
  dailyDeckList: document.getElementById("dailyDeckList"),
  dailyDeckCount: document.getElementById("dailyDeckCount"),
};

let refreshTimer = null;
let reminderTimer = null;
let ambientCtx = null;
let ambientTimer = null;

init();

function init() {
  load();
  ensureDailyState();
  setupBlindFilters();
  bindEvents();
  applySettingsToInputs();
  applyAppearanceSettings();
  initSceneParallax();
  render();
  scheduleSync();
  scheduleReminders();
}

function bindEvents() {
  els.syncBtn.addEventListener("click", syncFromSheet);
  els.requestNotifBtn.addEventListener("click", requestNotifications);
  els.testNotifBtn.addEventListener("click", () => sendReminder("Test reminder", "Work Pulse reminders are active."));
  els.csvFileInput.addEventListener("change", importCsvFile);
  els.addForm.addEventListener("submit", (event) => {
    event.preventDefault();
    addManualItem();
  });
  [
    els.sheetUrl,
    els.refreshMinutes,
    els.reminderMinutes,
    els.preferAltLinks,
    els.themeMode,
    els.layoutMode,
    els.soundEnabled,
    els.confettiEnabled,
    els.ambientEnabled,
  ].forEach((input) => input.addEventListener("change", saveSettingsFromInputs));

  els.dueList.addEventListener("click", (event) => {
    const btn = event.target.closest("[data-review-id]");
    if (!btn) return;
    applyReview(btn.getAttribute("data-review-id"), Number(btn.getAttribute("data-quality")));
  });

  els.allItems.addEventListener("click", (event) => {
    const btn = event.target.closest("[data-complete-id]");
    if (!btn) return;
    markComplete(btn.getAttribute("data-complete-id"));
  });

  els.challengeBtn.addEventListener("click", rollChallenge);
  els.loadBlindSetBtn.addEventListener("click", loadBlindSetToTracker);
  els.clearDeckBtn.addEventListener("click", clearDailyDeck);
  [els.b75Search, els.b75Category, els.b75Difficulty].forEach((el) => el.addEventListener("input", renderBlindList));

  els.blindList.addEventListener("click", (event) => {
    const flipBtn = event.target.closest("[data-flip-card]");
    if (flipBtn) {
      toggleCardFlip(flipBtn.getAttribute("data-flip-card"));
      return;
    }
    const addBtn = event.target.closest("[data-add-blind]");
    if (addBtn) {
      const card = addBtn.closest("[data-card-id]");
      addBlindToTracker(addBtn.getAttribute("data-add-blind"), card);
    }
    const solveBtn = event.target.closest("[data-solve-blind]");
    if (solveBtn) markBlindSolved(solveBtn.getAttribute("data-solve-blind"));
    const deckBtn = event.target.closest("[data-deck-add]");
    if (deckBtn) addToDailyDeck(deckBtn.getAttribute("data-deck-add"));
    const deckRemoveBtn = event.target.closest("[data-deck-remove]");
    if (deckRemoveBtn) removeFromDailyDeck(deckRemoveBtn.getAttribute("data-deck-remove"));
  });

  els.blindList.addEventListener("dragstart", (event) => {
    const card = event.target.closest("[data-card-id]");
    if (!card) return;
    event.dataTransfer?.setData("text/plain", card.getAttribute("data-card-id"));
    card.classList.add("is-dragging");
  });

  els.blindList.addEventListener("dragend", (event) => {
    const card = event.target.closest("[data-card-id]");
    if (card) card.classList.remove("is-dragging");
  });

  els.dailyDeckDrop.addEventListener("dragover", (event) => {
    event.preventDefault();
    els.dailyDeckDrop.classList.add("active");
  });

  els.dailyDeckDrop.addEventListener("dragleave", () => {
    els.dailyDeckDrop.classList.remove("active");
  });

  els.dailyDeckDrop.addEventListener("drop", (event) => {
    event.preventDefault();
    els.dailyDeckDrop.classList.remove("active");
    const blindId = event.dataTransfer?.getData("text/plain");
    if (blindId) addToDailyDeck(blindId);
  });

  els.dailyDeckList.addEventListener("click", (event) => {
    const removeBtn = event.target.closest("[data-deck-remove]");
    if (removeBtn) removeFromDailyDeck(removeBtn.getAttribute("data-deck-remove"));
  });
}

function setupBlindFilters() {
  const categories = ["All categories", ...new Set(BLIND_ITEMS.map((i) => i.category))];
  els.b75Category.innerHTML = categories.map((c) => `<option>${escapeHtml(c)}</option>`).join("");
  els.b75Difficulty.innerHTML = ["All difficulty", "Easy", "Medium", "Hard"]
    .map((d) => `<option>${d}</option>`)
    .join("");
}

async function importCsvFile(event) {
  const [file] = event.target.files || [];
  if (!file) return;
  try {
    const text = await file.text();
    const imported = rowsToItems(parseCsv(text));
    mergeImportedItems(imported);
    grantXp(20, "CSV import complete");
    setStatus(`Imported ${imported.length} rows from CSV.`);
    addReminderLog(`Imported ${imported.length} items from CSV.`);
    save();
    render();
  } catch {
    setStatus("Could not read CSV file.", true);
  } finally {
    event.target.value = "";
  }
}

function saveSettingsFromInputs() {
  state.settings.sheetUrl = els.sheetUrl.value.trim();
  state.settings.refreshMinutes = clampNumber(els.refreshMinutes.value, 5, 240, 30);
  state.settings.reminderMinutes = clampNumber(els.reminderMinutes.value, 5, 180, 20);
  state.settings.preferAltLinks = Boolean(els.preferAltLinks.checked);
  state.settings.themeMode = els.themeMode.value || "dark";
  state.settings.layoutMode = els.layoutMode.value || "default";
  state.settings.soundEnabled = Boolean(els.soundEnabled.checked);
  state.settings.confettiEnabled = Boolean(els.confettiEnabled.checked);
  state.settings.ambientEnabled = Boolean(els.ambientEnabled.checked);
  save();
  applyAppearanceSettings();
  scheduleSync();
  scheduleReminders();
  renderBlindList();
}

function applySettingsToInputs() {
  els.sheetUrl.value = state.settings.sheetUrl || els.sheetUrl.value;
  els.refreshMinutes.value = state.settings.refreshMinutes;
  els.reminderMinutes.value = state.settings.reminderMinutes;
  els.preferAltLinks.checked = Boolean(state.settings.preferAltLinks);
  els.themeMode.value = state.settings.themeMode || "dark";
  els.layoutMode.value = state.settings.layoutMode || "default";
  els.soundEnabled.checked = state.settings.soundEnabled !== false;
  els.confettiEnabled.checked = state.settings.confettiEnabled !== false;
  els.ambientEnabled.checked = state.settings.ambientEnabled === true;
}

function applyAppearanceSettings() {
  const root = document.documentElement;
  const mode = state.settings.themeMode === "light" ? "light" : "dark";
  root.setAttribute("data-theme", mode);
  document.body.classList.toggle("mode-compact", state.settings.layoutMode === "compact");
  document.body.classList.toggle("mode-focus", state.settings.layoutMode === "focus");
  updateAmbientAudio();
}

function initSceneParallax() {
  if (!els.animeScene) return;
  const layers = {
    sky: els.animeScene.querySelector(".sky-layer"),
    sunMoon: els.animeScene.querySelector(".sun-moon"),
    cloudA: els.animeScene.querySelector(".cloud-a"),
    cloudB: els.animeScene.querySelector(".cloud-b"),
    field: els.animeScene.querySelector(".field-line"),
    grass: els.animeScene.querySelector(".grass-band"),
    boy: els.animeScene.querySelector(".boy-silhouette"),
    fire: els.animeScene.querySelector(".campfire"),
  };

  els.animeScene.addEventListener("mousemove", (event) => {
    const rect = els.animeScene.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    if (layers.sky) layers.sky.style.transform = `translate(${x * 8}px, ${y * 4}px)`;
    if (layers.sunMoon) layers.sunMoon.style.transform = `translate(${x * 18}px, ${y * 8}px)`;
    if (layers.cloudA) layers.cloudA.style.transform = `translate(${x * 14}px, ${y * 5}px)`;
    if (layers.cloudB) layers.cloudB.style.transform = `translate(${x * 20}px, ${y * 6}px)`;
    if (layers.field) layers.field.style.transform = `translate(${x * 9}px, ${y * 2}px)`;
    if (layers.grass) layers.grass.style.transform = `translate(${x * 10}px, 0)`;
    if (layers.boy) layers.boy.style.transform = `translate(calc(-50% + ${x * 5}px), ${y * 2}px)`;
    if (layers.fire) layers.fire.style.transform = `translate(${x * 4}px, ${y * 3}px)`;
  });

  els.animeScene.addEventListener("mouseleave", () => {
    Object.values(layers).forEach((layer) => {
      if (layer) layer.style.transform = "";
    });
  });
}

function toggleCardFlip(cardId) {
  const card = els.blindList.querySelector(`[data-card-id="${cardId}"]`);
  if (!card) return;
  card.classList.toggle("is-flipped");
}

function updateAmbientAudio() {
  if (!state.settings.ambientEnabled) {
    stopAmbientAudio();
    return;
  }
  startAmbientAudio();
}

function startAmbientAudio() {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return;
  if (!ambientCtx) ambientCtx = new AudioCtx();
  if (ambientCtx.state === "suspended") ambientCtx.resume();
  if (ambientTimer) clearInterval(ambientTimer);

  const isDay = state.settings.themeMode === "light";
  ambientTimer = setInterval(() => {
    if (isDay) playBirdChirp();
    else playFireCrackle();
  }, isDay ? 2300 : 320);
}

function stopAmbientAudio() {
  if (ambientTimer) {
    clearInterval(ambientTimer);
    ambientTimer = null;
  }
  if (ambientCtx) {
    ambientCtx.close();
    ambientCtx = null;
  }
}

function playBirdChirp() {
  if (!ambientCtx || Math.random() < 0.36) return;
  const osc = ambientCtx.createOscillator();
  const gain = ambientCtx.createGain();
  osc.type = "sine";
  const start = ambientCtx.currentTime;
  const base = 1300 + Math.random() * 900;
  osc.frequency.setValueAtTime(base, start);
  osc.frequency.exponentialRampToValueAtTime(base * 1.35, start + 0.08);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(0.02, start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.13);
  osc.connect(gain);
  gain.connect(ambientCtx.destination);
  osc.start(start);
  osc.stop(start + 0.14);
}

function playFireCrackle() {
  if (!ambientCtx || Math.random() < 0.55) return;
  const len = Math.floor(ambientCtx.sampleRate * 0.035);
  const buffer = ambientCtx.createBuffer(1, len, ambientCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < len; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const source = ambientCtx.createBufferSource();
  source.buffer = buffer;
  const filter = ambientCtx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 1100 + Math.random() * 1200;
  const gain = ambientCtx.createGain();
  gain.gain.value = 0.014;
  source.connect(filter);
  filter.connect(gain);
  gain.connect(ambientCtx.destination);
  source.start();
}

function addManualItem() {
  const title = els.newTitle.value.trim();
  if (!title) return;
  state.items.unshift({
    id: `manual-${Date.now()}`,
    title,
    category: els.newCategory.value.trim() || "General",
    status: "open",
    source: "manual",
    srs: getDefaultSrs(),
  });
  els.addForm.reset();
  grantXp(8, "Quick add");
  addReminderLog(`Added: ${title}`);
  save();
  render();
}

async function syncFromSheet() {
  saveSettingsFromInputs();
  if (!state.settings.sheetUrl) return setStatus("Add your Google Sheet URL first.", true);
  const gvizUrl = toGvizJsonpUrl(state.settings.sheetUrl);
  if (!gvizUrl) return setStatus("Could not parse sheet URL.", true);
  setStatus("Sync in progress...");

  try {
    const rows = await loadRowsFromGvizJsonp(gvizUrl);
    const imported = rowsToItems(rows);
    mergeImportedItems(imported);
    grantXp(30, "Sheet sync");
    setStatus(`Synced ${imported.length} rows from your sheet.`);
    addReminderLog(`Sheet sync complete (${imported.length} rows).`);
    save();
    render();
  } catch {
    setStatus("Sync failed. Check sharing and gid.", true);
  }
}

function toGvizJsonpUrl(sheetUrl) {
  const match = sheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (!match) return "";
  const gidMatch = sheetUrl.match(/[?#&]gid=(\d+)/);
  return `https://docs.google.com/spreadsheets/d/${match[1]}/gviz/tq?tqx=out:json&gid=${gidMatch ? gidMatch[1] : "0"}`;
}

function loadRowsFromGvizJsonp(baseUrl) {
  return new Promise((resolve, reject) => {
    const callbackName = `workPulseGviz_${Date.now()}`;
    const script = document.createElement("script");
    const cleanup = () => {
      delete window[callbackName];
      script.remove();
    };
    window[callbackName] = (payload) => {
      try {
        const table = payload && payload.table;
        const headers = table.cols.map((col, i) => col.label || col.id || `col_${i + 1}`);
        const rows = [headers];
        table.rows.forEach((row) => rows.push((row.c || []).map((cell) => (cell && (cell.f ?? cell.v) ? String(cell.f ?? cell.v) : ""))));
        cleanup();
        resolve(rows);
      } catch (error) {
        cleanup();
        reject(error);
      }
    };
    script.onerror = () => {
      cleanup();
      reject(new Error("Sheet script failed"));
    };
    script.src = `${baseUrl};responseHandler:${callbackName}`;
    document.body.appendChild(script);
  });
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let value = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];
    if (char === '"') {
      if (inQuotes && next === '"') {
        value += '"';
        i += 1;
      } else inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      row.push(value.trim());
      value = "";
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") i += 1;
      row.push(value.trim());
      value = "";
      if (row.some((cell) => cell.length)) rows.push(row);
      row = [];
    } else value += char;
  }
  if (value || row.length) {
    row.push(value.trim());
    if (row.some((cell) => cell.length)) rows.push(row);
  }
  return rows;
}

function rowsToItems(rows) {
  if (!rows.length) return [];
  const headers = rows[0].map(normalize);
  const items = [];
  for (let i = 1; i < rows.length; i += 1) {
    const line = rows[i];
    const get = (names) => names.map((n) => line[headers.indexOf(n)]).find((x) => x) || "";
    const title = get(["title", "task", "work", "topic", "name"]);
    if (!title) continue;
    items.push({
      id: get(["id"]) || `sheet-${normalize(title)}-${i}`,
      title,
      category: get(["category", "area", "project", "type"]) || "General",
      status: get(["status", "state"]) || "open",
      source: "sheet",
      dueDate: get(["due", "deadline", "date"]),
      srs: getDefaultSrs(),
    });
  }
  return items;
}

function normalize(v) {
  return String(v || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "_");
}

function mergeImportedItems(importedItems) {
  const existing = new Map(state.items.map((item) => [item.id, item]));
  const keep = state.items.filter((item) => item.source !== "sheet");
  const mergedSheet = importedItems.map((item) => {
    const prev = existing.get(item.id);
    return prev ? { ...item, srs: prev.srs || getDefaultSrs() } : item;
  });
  state.items = [...keep, ...mergedSheet];
}

function getDefaultSrs() {
  return { repetitions: 0, interval: 1, ease: 2.5, lastReviewed: null, nextReview: new Date().toISOString() };
}

function isDue(item) {
  return new Date(item.srs.nextReview).getTime() <= Date.now();
}

function applyReview(itemId, quality) {
  const item = state.items.find((it) => it.id === itemId);
  if (!item) return;
  const srs = { ...item.srs };
  srs.ease = Math.max(1.3, srs.ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
  if (quality < 3) {
    srs.repetitions = 0;
    srs.interval = 1;
  } else {
    srs.repetitions += 1;
    srs.interval = srs.repetitions === 1 ? 1 : srs.repetitions === 2 ? 3 : Math.max(1, Math.round(srs.interval * srs.ease));
  }
  srs.lastReviewed = new Date().toISOString();
  srs.nextReview = new Date(Date.now() + srs.interval * 86400000).toISOString();
  item.srs = srs;
  state.game.totalReviews += 1;
  ensureDailyState();
  state.game.daily.reviews += 1;
  grantXp({ 1: 2, 3: 6, 4: 10, 5: 14 }[quality] || 5, `Review: ${qualityLabel(quality)}`);
  addReminderLog(`Reviewed: ${item.title} (${qualityLabel(quality)})`);
  save();
  render();
}

function markComplete(itemId) {
  const item = state.items.find((it) => it.id === itemId);
  if (!item || /done|complete/i.test(item.status)) return;
  item.status = "completed";
  grantXp(12, "Task completed");
  celebrate("task");
  save();
  render();
}

function addBlindToTracker(blindId, cardEl) {
  const ref = BLIND_ITEMS.find((i) => i.id === blindId);
  if (!ref) return;
  if (state.items.some((item) => item.blindId === blindId)) return;
  if (cardEl) animateCardToTracker(cardEl);
  state.items.unshift({
    id: `blind-${blindId}`,
    blindId,
    title: ref.title,
    category: ref.category,
    difficulty: ref.difficulty,
    status: "open",
    source: "blind75",
    srs: getDefaultSrs(),
  });
  grantXp(6, "Blind item added");
  save();
  render();
}

function animateCardToTracker(cardEl) {
  const targetEl = els.allItems?.closest("section") || els.totalCount;
  if (!cardEl || !targetEl) return;

  const from = cardEl.getBoundingClientRect();
  const to = targetEl.getBoundingClientRect();
  const clone = cardEl.cloneNode(true);

  clone.classList.add("flying-card");
  clone.style.left = `${from.left}px`;
  clone.style.top = `${from.top}px`;
  clone.style.width = `${from.width}px`;
  clone.style.height = `${from.height}px`;
  document.body.appendChild(clone);

  requestAnimationFrame(() => {
    clone.style.transition = "transform 520ms cubic-bezier(0.2, 0.8, 0.22, 1), opacity 520ms ease";
    clone.style.transform = `translate(${to.left - from.left}px, ${to.top - from.top}px) scale(0.22)`;
    clone.style.opacity = "0.15";
  });

  cardEl.classList.add("card-picked");
  setTimeout(() => cardEl.classList.remove("card-picked"), 520);
  setTimeout(() => clone.remove(), 560);
}

function markBlindSolved(blindId) {
  if (state.game.solvedBlind.includes(blindId)) return;
  state.game.solvedBlind.push(blindId);
  ensureDailyState();
  state.game.daily.solves += 1;
  grantXp(20, "Problem solved");
  state.game.coins += 5;
  celebrate("solve");
  save();
  render();
}

function loadBlindSetToTracker() {
  let added = 0;
  BLIND_ITEMS.forEach((item) => {
    if (!state.items.some((it) => it.blindId === item.id)) {
      state.items.push({
        id: `blind-${item.id}`,
        blindId: item.id,
        title: item.title,
        category: item.category,
        difficulty: item.difficulty,
        status: "open",
        source: "blind75",
        srs: getDefaultSrs(),
      });
      added += 1;
    }
  });
  grantXp(25, "Blind 75 loaded");
  setStatus(`Added ${added} Blind 75 items to your tracker.`);
  save();
  render();
}

function addToDailyDeck(blindId) {
  if (!BLIND_ITEMS.some((item) => item.id === blindId)) return;
  if (!state.game.dailyDeck.includes(blindId)) {
    state.game.dailyDeck.push(blindId);
    grantXp(3, "Deck updated");
    save();
    render();
  }
}

function removeFromDailyDeck(blindId) {
  const next = state.game.dailyDeck.filter((id) => id !== blindId);
  if (next.length === state.game.dailyDeck.length) return;
  state.game.dailyDeck = next;
  save();
  render();
}

function clearDailyDeck() {
  state.game.dailyDeck = [];
  save();
  render();
}

function grantXp(amount, reason) {
  state.game.xp += amount;
  const nextLevelXp = state.game.level * 120;
  if (state.game.xp >= nextLevelXp) {
    state.game.level += 1;
    state.game.coins += 10;
    addReminderLog(`Level up! Reached level ${state.game.level}.`);
    celebrate("level");
  }
  unlockAchievements();
  if (reason) addReminderLog(`+${amount} XP: ${reason}`);
}

function celebrate(type) {
  if (state.settings.soundEnabled) playRewardSound(type);
  if (state.settings.confettiEnabled) spawnConfetti(type);
}

function playRewardSound(type) {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return;
  const ctx = new AudioCtx();
  const presets = {
    task: [440, 554],
    solve: [520, 660, 790],
    level: [660, 790, 990],
  };
  const notes = presets[type] || [520, 660];
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.value = freq;
    osc.connect(gain);
    gain.connect(ctx.destination);
    const start = ctx.currentTime + i * 0.09;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.05, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.12);
    osc.start(start);
    osc.stop(start + 0.13);
  });
  setTimeout(() => ctx.close(), 600);
}

function spawnConfetti(type) {
  if (!els.confettiLayer) return;
  const colorsByType = {
    task: ["#66b8ff", "#46d9b1", "#ffcc7d"],
    solve: ["#46d9b1", "#66b8ff", "#ffffff"],
    level: ["#ffcc7d", "#ffdff4", "#9be1ff"],
  };
  const colors = colorsByType[type] || ["#66b8ff", "#46d9b1"];
  const burst = type === "level" ? 46 : 28;
  for (let i = 0; i < burst; i += 1) {
    const piece = document.createElement("span");
    piece.className = "confetti-piece";
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDelay = `${Math.random() * 140}ms`;
    piece.style.animationDuration = `${900 + Math.random() * 700}ms`;
    piece.style.transform = `translateY(-10px) rotate(${Math.random() * 180}deg)`;
    els.confettiLayer.appendChild(piece);
    setTimeout(() => piece.remove(), 1800);
  }
}

function unlockAchievements() {
  const solved = state.game.solvedBlind.length;
  const due = state.items.filter(isDue).length;
  const unlock = (id) => {
    if (!state.game.unlocked.includes(id)) state.game.unlocked.push(id);
  };
  if (state.items.some((i) => i.source === "sheet")) unlock("sheet_rookie");
  if (state.game.totalReviews >= 10) unlock("reviewer_10");
  if (solved >= 10) unlock("solver_10");
  if (state.game.level >= 5) unlock("level_5");
  if (state.game.streak >= 7) unlock("streak_7");
  if (due === 0 && state.items.length > 0) unlock("inbox_zero");
}

function achievementCatalog() {
  return {
    sheet_rookie: "Sheet Rookie: first successful sheet sync",
    reviewer_10: "Review Pilot: complete 10 reviews",
    solver_10: "Blind Hunter: solve 10 Blind 75 problems",
    level_5: "Momentum Builder: reach level 5",
    streak_7: "Discipline Beast: 7-day streak",
    inbox_zero: "Review Zen: no due reviews",
  };
}

function ensureDailyState() {
  const today = dayKey(new Date());
  if (state.game.daily.date === today) return;
  if (!state.game.daily.date) {
    state.game.streak = Math.max(state.game.streak, 1);
  } else {
    const prev = new Date(`${state.game.daily.date}T00:00:00`);
    const expected = dayKey(new Date(prev.getTime() + 86400000));
    state.game.streak = expected === today ? state.game.streak + 1 : 1;
  }
  state.game.daily = { date: today, reviews: 0, solves: 0 };
}

function dayKey(date) {
  return date.toISOString().slice(0, 10);
}

function qualityLabel(quality) {
  if (quality <= 1) return "Again";
  if (quality === 3) return "Hard";
  if (quality === 4) return "Good";
  return "Easy";
}

function rollChallenge() {
  const due = state.items.filter(isDue);
  const unsolvedBlind = BLIND_ITEMS.filter((i) => !state.game.solvedBlind.includes(i.id));
  const pool = [...due.map((d) => ({ type: "review", text: `Review '${d.title}' now` })), ...unsolvedBlind.slice(0, 20).map((q) => ({ type: "solve", text: `Solve '${q.title}' (${q.difficulty})` }))];
  if (!pool.length) {
    els.challengeText.textContent = "You cleared everything. Take a short break and come back stronger.";
    return;
  }
  const pick = pool[Math.floor(Math.random() * pool.length)];
  els.challengeText.textContent = `Challenge: ${pick.text}`;
}

function render() {
  const dueItems = state.items.filter(isDue);
  const completed = state.items.filter((item) => /done|complete/i.test(item.status)).length;
  const overdue = state.items.filter((item) => item.dueDate && !Number.isNaN(new Date(item.dueDate).getTime()) && new Date(item.dueDate).getTime() < Date.now()).length;
  const solvedBlind = state.game.solvedBlind.length;

  els.statsGrid.innerHTML = [
    statCard("Due reviews", dueItems.length),
    statCard("Total items", state.items.length),
    statCard("Completed", completed),
    statCard("Blind 75 solved", `${solvedBlind}/75`),
    statCard("Overdue deadlines", overdue),
  ].join("");

  const levelFloor = (state.game.level - 1) * 120;
  const levelTop = state.game.level * 120;
  const levelProgress = Math.max(0, Math.min(100, Math.round(((state.game.xp - levelFloor) / (levelTop - levelFloor)) * 100)));
  const reviewGoal = Math.min(100, Math.round((state.game.daily.reviews / 5) * 100));
  const solveGoal = Math.min(100, Math.round((state.game.daily.solves / 2) * 100));

  els.gameHud.innerHTML = `
    <div class="xp-line"><span>Level ${state.game.level}</span><span>${state.game.xp} XP</span></div>
    <div class="progress"><span style="width:${levelProgress}%"></span></div>
    <div class="game-stats">
      ${statCard("Coins", state.game.coins)}
      ${statCard("Streak", `${state.game.streak} days`)}
      ${statCard("Today reviews", `${state.game.daily.reviews}/5`)}
      ${statCard("Today solves", `${state.game.daily.solves}/2`)}
    </div>
    <div class="meta">Daily quest progress: reviews ${reviewGoal}% | solves ${solveGoal}%</div>
  `;

  const catalog = achievementCatalog();
  els.achievementCount.textContent = `${state.game.unlocked.length} unlocked`;
  els.achievementList.innerHTML = Object.entries(catalog)
    .map(([id, text]) => `<div class="achievement ${state.game.unlocked.includes(id) ? "" : "meta"}">${state.game.unlocked.includes(id) ? "Unlocked" : "Locked"} - ${escapeHtml(text)}</div>`)
    .join("");

  els.dueCount.textContent = `${dueItems.length} items`;
  els.totalCount.textContent = `${state.items.length} total`;
  els.dueList.innerHTML = dueItems.length ? dueItems.map(renderDueItem).join("") : `<p class="meta">Nothing due now. Great pace.</p>`;
  els.allItems.innerHTML = state.items.length ? state.items.map(renderItem).join("") : `<p class="meta">No work items yet. Sync your sheet to begin.</p>`;
  els.reminderLog.innerHTML = state.reminders.length
    ? state.reminders.slice(0, 30).map((log) => `<div>${escapeHtml(log)}</div>`).join("")
    : `<div class="meta">No reminders sent yet.</div>`;
  renderBlindList();
  renderDailyDeck();
}

function renderBlindList() {
  const q = normalize(els.b75Search.value || "").replaceAll("_", "");
  const category = els.b75Category.value;
  const difficulty = els.b75Difficulty.value;
  const filtered = BLIND_ITEMS.filter((item) => {
    const matchesSearch = !q || normalize(item.title).replaceAll("_", "").includes(q);
    const matchesCategory = category === "All categories" || item.category === category;
    const matchesDifficulty = difficulty === "All difficulty" || item.difficulty === difficulty;
    return matchesSearch && matchesCategory && matchesDifficulty;
  });
  els.blindCount.textContent = `${filtered.length} shown`;
  els.blindList.innerHTML = filtered
    .map((item, idx) => {
      const inTracker = state.items.some((it) => it.blindId === item.id);
      const solved = state.game.solvedBlind.includes(item.id);
      const inDeck = state.game.dailyDeck.includes(item.id);
      const primaryUrl = item.premium && state.settings.preferAltLinks ? item.alt : item.link;
      const hp = getCardHp(item.difficulty);
      const energy = getCategoryEnergy(item.category);
      return `<article class="item quest-card pokemon-card ${inTracker ? "is-tracked" : ""} ${solved ? "is-solved" : ""} ${item.difficulty === "Hard" ? "foil-hard" : ""} cat-${normalize(item.category).replaceAll("_", "-")}" data-card-id="${item.id}" draggable="true">
        <div class="pokemon-card-inner">
          <div class="pokemon-face pokemon-front">
            <div class="card-topline pokemon-top">
              <span class="card-type">${escapeHtml(item.category)}</span>
              <span class="card-rank">#${String(idx + 1).padStart(2, "0")}</span>
            </div>
            <div class="pokemon-name-row">
              <strong><a href="${primaryUrl}" target="_blank" rel="noreferrer">${escapeHtml(item.title)}</a></strong>
              <span class="pokemon-hp">HP ${hp}</span>
            </div>
            <div class="pokemon-art" data-flip-card="${item.id}">
              <div class="pokemon-art-glow"></div>
              <div class="pokemon-energy">${energy}</div>
            </div>
            <div class="pokemon-moves">
              <div><span>Recall</span><b>${item.difficulty} Focus</b></div>
              <div><span>Combo</span><b>${inDeck ? "Deck Linked" : "Solo Queue"}</b></div>
            </div>
            <div class="meta">${solved ? "Captured" : inTracker ? "In your tracker" : "Wild card"}${item.premium ? " | Premium" : ""}</div>
            <div class="item-actions">
              <button data-add-blind="${item.id}" ${inTracker ? "disabled" : ""}>${inTracker ? "In tracker" : "Add to tracker"}</button>
              <button data-deck-add="${item.id}" ${inDeck ? "disabled" : ""}>${inDeck ? "In daily deck" : "Add to daily deck"}</button>
              <button data-solve-blind="${item.id}" ${solved ? "disabled" : ""}>${solved ? "Solved" : "Mark solved +20XP"}</button>
              <button data-flip-card="${item.id}">Flip</button>
            </div>
          </div>
          <div class="pokemon-face pokemon-back">
            <div>
              <div class="card-topline pokemon-top">
                <span class="card-type">${escapeHtml(item.category)} Notes</span>
                <span class="card-rank">${item.difficulty}</span>
              </div>
              <p>Tip: explain approach out loud and track one edge case before coding.</p>
              <p class="flip-hint">This side is your quick strategy card.</p>
            </div>
            <div class="item-actions">
              <a href="${item.link}" target="_blank" rel="noreferrer">LeetCode</a>
              <a href="${item.alt}" target="_blank" rel="noreferrer">Alt</a>
              <button data-flip-card="${item.id}">Flip Back</button>
            </div>
          </div>
        </div>
      </article>`;
    })
    .join("");
}

function renderDailyDeck() {
  const cards = state.game.dailyDeck
    .map((id) => BLIND_ITEMS.find((item) => item.id === id))
    .filter(Boolean);
  els.dailyDeckCount.textContent = `${cards.length} cards`;
  els.dailyDeckList.innerHTML = cards.length
    ? cards
        .map(
          (item, idx) => `<article class="item">
      <div class="item-head">
        <strong><a href="${item.link}" target="_blank" rel="noreferrer">${escapeHtml(item.title)}</a></strong>
        <span class="card-rank">S${idx + 1}</span>
      </div>
      <div class="meta">${escapeHtml(item.category)} | ${item.difficulty}</div>
      <div class="item-actions">
        <button data-deck-remove="${item.id}">Remove</button>
        <a href="${item.link}" target="_blank" rel="noreferrer">Open</a>
      </div>
    </article>`,
        )
        .join("")
    : `<p class="meta">No cards in your daily deck yet. Drag cards into the drop zone above.</p>`;
}

function renderDueItem(item) {
  const titleHtml = renderLinkedTitle(item);
  return `<article class="item">
    <div class="item-head">
      <strong>${titleHtml}</strong>
      <span class="pill">${escapeHtml(item.category)}</span>
    </div>
    <div class="meta">Next review: ${formatDate(item.srs.nextReview)} | Interval: ${item.srs.interval}d</div>
    <div class="review-actions">
      <button class="again" data-review-id="${item.id}" data-quality="1">Again</button>
      <button data-review-id="${item.id}" data-quality="3">Hard</button>
      <button class="good" data-review-id="${item.id}" data-quality="4">Good</button>
      <button class="good" data-review-id="${item.id}" data-quality="5">Easy</button>
    </div>
  </article>`;
}

function renderItem(item) {
  const titleHtml = renderLinkedTitle(item);
  const completed = /done|complete/i.test(item.status);
  return `<article class="item">
    <div class="item-head">
      <strong>${titleHtml}</strong>
      <span class="pill">${escapeHtml(item.status)}</span>
    </div>
    <div class="meta">${escapeHtml(item.category)} | Next review: ${formatDate(item.srs.nextReview)}</div>
    ${completed ? "" : `<div class=\"item-actions\"><button data-complete-id=\"${item.id}\">Complete +12XP</button></div>`}
  </article>`;
}

function renderLinkedTitle(item) {
  if (!item.blindId) return escapeHtml(item.title);
  const ref = BLIND_ITEMS.find((q) => q.id === item.blindId);
  if (!ref) return escapeHtml(item.title);
  const href = ref.premium && state.settings.preferAltLinks ? ref.alt : ref.link;
  return `<a href="${href}" target="_blank" rel="noreferrer">${escapeHtml(item.title)}</a>`;
}

function statCard(label, value) {
  return `<div class="stat"><p>${label}</p><strong>${value}</strong></div>`;
}

function escapeHtml(text) {
  return String(text || "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function formatDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleDateString();
}

function getCardHp(difficulty) {
  if (difficulty === "Hard") return 150;
  if (difficulty === "Medium") return 110;
  return 80;
}

function getCategoryEnergy(category) {
  const key = normalize(category);
  const map = {
    array: "A",
    dynamic_programming: "D",
    graph: "G",
    tree: "T",
    string: "S",
    linked_list: "L",
    bit_manipulation: "B",
    matrix: "M",
    interval: "I",
    heap: "H",
    backtracking: "R",
  };
  return map[key] || "Q";
}

function clampNumber(raw, min, max, fallback) {
  const num = Number(raw);
  if (Number.isNaN(num)) return fallback;
  return Math.min(Math.max(num, min), max);
}

function scheduleSync() {
  if (refreshTimer) clearInterval(refreshTimer);
  refreshTimer = setInterval(syncFromSheet, state.settings.refreshMinutes * 60000);
}

function scheduleReminders() {
  if (reminderTimer) clearInterval(reminderTimer);
  reminderTimer = setInterval(checkReminders, state.settings.reminderMinutes * 60000);
}

function checkReminders() {
  const dueItems = state.items.filter(isDue);
  if (!dueItems.length) return;
  sendReminder(`You have ${dueItems.length} items due`, `Start with: ${dueItems[0].title}`);
}

async function requestNotifications() {
  if (!("Notification" in window)) return setStatus("This browser does not support notifications.", true);
  const permission = await Notification.requestPermission();
  state.settings.notifications = permission === "granted";
  save();
  setStatus(permission === "granted" ? "Notifications enabled." : "Notification permission not granted.");
}

function sendReminder(title, body) {
  addReminderLog(`[${new Date().toLocaleString()}] ${title} - ${body}`);
  if ("Notification" in window && Notification.permission === "granted") new Notification(title, { body });
}

function addReminderLog(message) {
  state.reminders.unshift(message);
  state.reminders = state.reminders.slice(0, 120);
}

function setStatus(message, isError = false) {
  els.syncStatus.textContent = message;
  els.syncStatus.style.color = isError ? "var(--danger)" : "var(--muted)";
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    state.items = Array.isArray(parsed.items) ? parsed.items : [];
    state.reminders = Array.isArray(parsed.reminders) ? parsed.reminders : [];
    state.settings = { ...state.settings, ...(parsed.settings || {}) };
    state.game = {
      ...state.game,
      ...(parsed.game || {}),
      solvedBlind: Array.isArray(parsed.game?.solvedBlind) ? parsed.game.solvedBlind : [],
      dailyDeck: Array.isArray(parsed.game?.dailyDeck) ? parsed.game.dailyDeck : [],
      unlocked: Array.isArray(parsed.game?.unlocked) ? parsed.game.unlocked : [],
    };
  } catch {
    state.items = [];
  }
}
