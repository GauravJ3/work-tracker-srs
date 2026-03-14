import { Archive, Clock3, Layers3, Sparkles } from "lucide-react";
import TrainerCard from "../cards/TrainerCard";

function RitualChamber({ deck, session, currentItem, progress, nextDeck, onBegin, onAnswer, onClose }) {
  const elapsed = Math.max(1, Math.round((Date.now() - session.startedAt) / 1000));
  const estimatedMinutes = Math.max(2, Math.round(session.queue.length * 1.2));
  const answeredAgain = session.reviewed.filter((entry) => entry.quality <= 1).length;
  const roundedMinutes = Math.max(1, Math.round(elapsed / 60));

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

        {session.step === "intro" ? (
          <div className="session-intro">
            <p className="eyebrow">Prepare The Ritual</p>
            <h3>{deck?.name || "Session"} is ready.</h3>
            <p className="session-copy">
              One card at a time. Quiet pace. Clear finish. Begin when you are ready to settle into the queue.
            </p>
            <div className="session-kpis">
              <div className="session-kpi">
                <Layers3 size={16} />
                <span>{session.queue.length} cards queued</span>
              </div>
              <div className="session-kpi">
                <Clock3 size={16} />
                <span>About {estimatedMinutes} min</span>
              </div>
            </div>
            <div className="session-intro-actions">
              <button className="button button-primary" type="button" onClick={onBegin}>
                <Sparkles size={16} />
                Begin ritual
              </button>
              <button className="button button-ghost" type="button" onClick={onClose}>
                <Archive size={16} />
                Finish later
              </button>
            </div>
          </div>
        ) : session.step === "complete" ? (
          <div className="session-complete">
            <p className="eyebrow">Ritual Complete</p>
            <h3>You cleared {session.reviewed.length} cards.</h3>
            <p>That ritual took about {roundedMinutes} minute{roundedMinutes === 1 ? "" : "s"} and left {answeredAgain} reset card{answeredAgain === 1 ? "" : "s"} to revisit later.</p>
            <div className="session-kpis session-kpis-complete">
              <div className="session-kpi">
                <Layers3 size={16} />
                <span>{session.reviewed.length} reviewed</span>
              </div>
              <div className="session-kpi">
                <Clock3 size={16} />
                <span>{roundedMinutes} min total</span>
              </div>
            </div>
            {nextDeck?.id && nextDeck.id !== deck?.id ? (
              <div className="session-next-deck">
                <span className="section-chip">Next suggestion</span>
                <strong>{nextDeck.name}</strong>
                <p>{nextDeck.copy}</p>
              </div>
            ) : null}
            <div className="session-intro-actions">
              <button className="button button-primary" type="button" onClick={onClose}>
                <Sparkles size={16} />
                Return to studio
              </button>
            </div>
          </div>
        ) : currentItem ? (
          <>
            <div className="progress-caption">
              <span>
                Card {Math.min(session.index + 1, session.queue.length)} of {session.queue.length}
              </span>
              <span>{elapsed}s</span>
            </div>
            <div className="progress-track">
              <span style={{ width: `${progress}%` }} />
            </div>
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
