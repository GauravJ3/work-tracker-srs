export function toGvizUrl(sheetUrl) {
  const match = String(sheetUrl).match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (!match) return "";
  const gidMatch = String(sheetUrl).match(/[?#&]gid=(\d+)/);
  const gid = gidMatch ? gidMatch[1] : "0";
  return `https://docs.google.com/spreadsheets/d/${match[1]}/gviz/tq?tqx=out:json&gid=${gid}`;
}

function extractPayload(raw) {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1) {
    throw new Error("Could not parse Google Sheets response.");
  }
  return JSON.parse(raw.slice(start, end + 1));
}

export async function fetchSheetRows(sheetUrl) {
  const gvizUrl = toGvizUrl(sheetUrl);
  if (!gvizUrl) throw new Error("Invalid Google Sheet URL.");

  const response = await fetch(gvizUrl);
  if (!response.ok) {
    throw new Error("Google Sheets request failed.");
  }

  const text = await response.text();
  const payload = extractPayload(text);
  const cols = payload.table?.cols || [];
  const rows = payload.table?.rows || [];
  const headers = cols.map((col, index) => col.label || col.id || `col_${index + 1}`);

  return [
    headers,
    ...rows.map((row) =>
      (row.c || []).map((cell) => {
        if (!cell) return "";
        return String(cell.f ?? cell.v ?? "");
      }),
    ),
  ];
}
