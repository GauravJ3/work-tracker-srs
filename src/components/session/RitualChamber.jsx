import { Archive, Sparkles } from "lucide-react";
import TrainerCard from "../cards/TrainerCard";

function RitualChamber({ deck, session, currentItem, progress, onAnswer, onClose }) {
  const elapsed = Math.max(1, Math.round((Date.now() - session.startedAt) / 1000));

  return (
    <div className="session-overlay">
      <div className="session-backdrop" onClick={onClose} />
      <div className={`session-shell ${session.step === "transition" ? "is-transitioning" : ""}`}>
        <div className="session-topbar">
          <div>
            <p className="eyebrow">Ritual Session</p>
            <h2>{deck?.name || "Session"}</h2>
          </div>
          <button className="button button-ghost" type="button" onClick={onClose}>
            <Archive size={16} />
            Leave ritual
          </button>
        </div>

        <div className="progress-caption">
          <span>
            Card {Math.min(session.index + 1, session.queue.length)} of {session.queue.length}
          </span>
          <span>{elapsed}s</span>
        </div>
        <div className="progress-track">
          <span style={{ width: `${progress}%` }} />
        </div>

        {session.step === "complete" ? (
          <div className="session-complete">
            <p className="eyebrow">Ritual Complete</p>
            <h3>You cleared {session.reviewed.length} cards.</h3>
            <p>Return to the studio when you want the next deck.</p>
            <button className="button button-primary" type="button" onClick={onClose}>
              <Sparkles size={16} />
              Return to studio
            </button>
          </div>
        ) : currentItem ? (
          <>
            <div className="session-card-frame">
              <TrainerCard item={currentItem} badge={`Card ${session.index + 1}`} variant="session" />
            </div>
            <div className="session-actions">
              {[1, 3, 4, 5].map((quality) => (
                <button
                  key={quality}
                  type="button"
                  className={`session-answer answer-${quality}`}
                  onClick={() => onAnswer(quality)}
                >
                  <span>{quality <= 1 ? "Again" : quality === 3 ? "Hard" : quality === 4 ? "Good" : "Easy"}</span>
                  <strong>
                    {quality === 1 ? "Reset" : quality === 3 ? "Tough" : quality === 4 ? "Good" : "Easy"}
                  </strong>
                </button>
              ))}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

export default RitualChamber;
