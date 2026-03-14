import TrainerCardHeader from "./TrainerCardHeader";

function difficultyTone(difficulty) {
  if (difficulty === "Hard") return "sun";
  if (difficulty === "Medium") return "wave";
  return "forest";
}

function deckSigil(name) {
  const clean = String(name || "").replace(/[^a-zA-Z0-9 ]+/g, "").trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return clean.slice(0, 2).toUpperCase() || "WP";
}

function TrainerCard({ item, badge, footer }) {
  return (
    <article className="trainer-card">
      <TrainerCardHeader tag={item.category} type={badge} />
      <div className={`trainer-art art-${difficultyTone(item.difficulty || "Medium")}`}>
        <div className="trainer-sigil">{deckSigil(item.title)}</div>
      </div>
      <div className="trainer-name-row">
        <strong>{item.title}</strong>
        <span className="trainer-hp">{item.dueDate ? item.dueDate : item.srs?.nextReview || "-"}</span>
      </div>
      <div className="trainer-info">
        <div>
          <span>Status</span>
          <b>{item.status}</b>
        </div>
        <div>
          <span>Recall</span>
          <b>{item.srs?.interval || 0} day interval</b>
        </div>
      </div>
      {footer ? <div className="trainer-footer">{footer}</div> : null}
    </article>
  );
}

export { deckSigil, difficultyTone };
export default TrainerCard;
