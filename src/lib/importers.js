import { createDefaultSrs } from "./srs";
import { createId, normalize } from "./utils";

export function parseCsv(text) {
  const rows = [];
  let row = [];
  let value = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        value += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(value.trim());
      value = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(value.trim());
      value = "";
      if (row.some((cell) => cell.length)) rows.push(row);
      row = [];
      continue;
    }

    value += char;
  }

  if (value || row.length) {
    row.push(value.trim());
    if (row.some((cell) => cell.length)) rows.push(row);
  }

  return rows;
}

export function rowsToItems(rows, source = "sheet") {
  if (!rows.length) return [];
  const headers = rows[0].map(normalize);
  const getIndex = (names) => headers.findIndex((header) => names.includes(header));

  return rows.slice(1).flatMap((line, index) => {
    const title = line[getIndex(["title", "task", "work", "topic", "name"])] || "";
    if (!title.trim()) return [];
    const category = line[getIndex(["category", "area", "project", "type"])] || "General";
    const status = line[getIndex(["status", "state"])] || "open";
    const dueDate = line[getIndex(["due", "deadline", "date"])] || "";
    const notes = line[getIndex(["notes", "description", "details"])] || "";
    const id = line[getIndex(["id"])] || `${source}-${normalize(title)}-${index + 1}`;

    return [
      {
        id,
        title: title.trim(),
        category: category.trim(),
        status: status.trim(),
        dueDate: dueDate.trim(),
        notes: notes.trim(),
        source,
        srs: createDefaultSrs(),
      },
    ];
  });
}

export function mergeImportedItems(existingItems, importedItems) {
  const previousById = new Map(existingItems.map((item) => [item.id, item]));
  const keep = existingItems.filter((item) => item.source !== "sheet");
  const mergedSheet = importedItems.map((item) => {
    const previous = previousById.get(item.id);
    if (!previous) return item;
    return {
      ...item,
      blindId: previous.blindId,
      srs: previous.srs || createDefaultSrs(),
    };
  });

  return [...keep, ...mergedSheet];
}

export function createManualItem({ title, category }) {
  return {
    id: createId("manual"),
    title: title.trim(),
    category: category.trim() || "General",
    status: "open",
    source: "manual",
    notes: "",
    dueDate: "",
    srs: createDefaultSrs(),
  };
}
