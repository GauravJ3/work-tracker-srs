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

function variantTone(variant, item) {
  if (variant === "session") return "rare";
  if (variant === "deck") return item.tone || "sun";
  if (variant === "blind") return difficultyTone(item.difficulty || "Medium");
  return difficultyTone(item.difficulty || "Medium");
}

function TrainerCard({ item, badge, footer, variant = "work", className = "", reveal = true }) {
  const tone = variantTone(variant, item);
  const dueText =
    variant === "session" && !reveal ? "Focus" : item.dueDate ? item.dueDate : item.srs?.nextReview || "-";
  const statusLabel =
    variant === "session" && !reveal
      ? "Keep the answer in mind before you reveal the rest of the card."
      : variant === "deck"
      ? item.description || item.copy || "Ready for a clean focused run."
      : item.status;
  const recallLabel =
    variant === "session" && !reveal
      ? "Reveal when ready"
      : variant === "blind"
      ? item.difficulty || "Medium"
      : variant === "session"
        ? item.notes || "Single-card ritual focus"
        : `${item.srs?.interval || 0} day interval`;

  return (
    <article className={`trainer-card trainer-card-${variant} ${className}`.trim()}>
      <TrainerCardHeader tag={item.category} type={badge} />
      <div className={`trainer-art art-${tone}`}>
        <div className="trainer-sigil">{deckSigil(item.title)}</div>
      </div>
      <div className="trainer-name-row">
        <strong>{item.title}</strong>
        <span className="trainer-hp">{dueText}</span>
      </div>
      <div className="trainer-info">
        <div>
          <span>{variant === "deck" ? "Mood" : "Status"}</span>
          <b>{statusLabel}</b>
        </div>
        <div>
          <span>{variant === "blind" ? "Challenge" : variant === "session" ? "Mode" : "Recall"}</span>
          <b>{recallLabel}</b>
        </div>
      </div>
      {footer ? <div className="trainer-footer">{footer}</div> : null}
    </article>
  );
}

export { deckSigil, difficultyTone };
export default TrainerCard;
