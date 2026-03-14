import { describe, expect, it } from "vitest";
import { parseCsv, rowsToItems } from "./importers";

describe("importers", () => {
  it("parses quoted csv rows safely", () => {
    const rows = parseCsv('title,notes\n"Focus block","Review ""critical"" path"');
    expect(rows).toEqual([
      ["title", "notes"],
      ["Focus block", 'Review "critical" path'],
    ]);
  });

  it("maps flexible headers into items with timestamps", () => {
    const items = rowsToItems(
      [
        ["Task", "Project", "State", "Deadline", "Details"],
        ["Draft launch notes", "Writing", "open", "2026-03-20", "Ship the recap"],
      ],
      "sheet",
    );

    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      title: "Draft launch notes",
      category: "Writing",
      status: "open",
      dueDate: "2026-03-20",
      notes: "Ship the recap",
      source: "sheet",
    });
    expect(items[0].createdAt).toBeTruthy();
    expect(items[0].srs).toBeTruthy();
  });
});
