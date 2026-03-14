import { useMemo, useState } from "react";
import { formatDayLabel } from "../../lib/utils";

function toKey(date) {
  return date.toISOString().slice(0, 10);
}

function monthLabel(date) {
  return date.toLocaleDateString(undefined, { month: "short" });
}

function intensityFor(entry) {
  const score =
    (entry?.reviews || 0) +
    (entry?.solves || 0) * 2 +
    (entry?.added || 0) +
    (entry?.rituals || 0) * 2;
  if (score <= 0) return 0;
  if (score <= 2) return 1;
  if (score <= 4) return 2;
  if (score <= 7) return 3;
  return 4;
}

function RitualCalendar({ history = {}, streak = 0 }) {
  const days = useMemo(() => {
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() - 167);
    return Array.from({ length: 168 }, (_, index) => {
      const value = new Date(start);
      value.setDate(start.getDate() + index);
      return value;
    });
  }, []);

  const defaultSelected = toKey(days[days.length - 1]);
  const [selectedKey, setSelectedKey] = useState(defaultSelected);

  const weeks = useMemo(() => {
    const columns = [];
    for (let index = 0; index < days.length; index += 7) {
      columns.push(days.slice(index, index + 7));
    }
    return columns;
  }, [days]);

  const monthMarkers = useMemo(
    () =>
      weeks.map((week, index) => {
        const first = week[0];
        const previous = weeks[index - 1]?.[0];
        const show = !previous || first.getMonth() !== previous.getMonth();
        return { index, label: show ? monthLabel(first) : "" };
      }),
    [weeks],
  );

  const selectedEntry = history[selectedKey] || { reviews: 0, solves: 0, added: 0, rituals: 0, xp: 0 };
  const ritualDays = Object.values(history).filter((entry) => intensityFor(entry) > 0).length;

  return (
    <div className="calendar-shell">
      <div className="calendar-legend">
        <strong>Ritual calendar</strong>
        <span>{ritualDays} active days • {streak} day streak</span>
      </div>
      <div className="calendar-scroll">
        <div className="calendar-months" aria-hidden="true">
          {monthMarkers.map((marker) => (
            <span
              key={`${marker.index}-${marker.label}`}
              className={marker.label ? "has-label" : ""}
              style={{ gridColumn: marker.index + 1 }}
            >
              {marker.label}
            </span>
          ))}
        </div>
        <div className="calendar-grid" role="grid" aria-label="Ritual activity calendar">
          {weeks.map((week, weekIndex) => (
            <div className="calendar-week" key={`week-${weekIndex}`}>
              {week.map((date) => {
                const key = toKey(date);
                const entry = history[key];
                const intensity = intensityFor(entry);
                return (
                  <button
                    key={key}
                    type="button"
                    role="gridcell"
                    className={`calendar-day level-${intensity} ${selectedKey === key ? "is-selected" : ""}`}
                    aria-label={`${formatDayLabel(key)}: ${entry?.reviews || 0} reviews, ${entry?.solves || 0} solves`}
                    onClick={() => setSelectedKey(key)}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <div className="calendar-detail">
        <strong>{formatDayLabel(selectedKey)}</strong>
        <div className="calendar-detail-grid">
          <span>Reviews <b>{selectedEntry.reviews || 0}</b></span>
          <span>Solves <b>{selectedEntry.solves || 0}</b></span>
          <span>Added <b>{selectedEntry.added || 0}</b></span>
          <span>Rituals <b>{selectedEntry.rituals || 0}</b></span>
        </div>
        <p>{selectedEntry.xp || 0} XP earned on this day.</p>
      </div>
    </div>
  );
}

export default RitualCalendar;
