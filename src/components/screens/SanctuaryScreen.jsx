import { Archive, ArrowRight, CheckCircle2, Play, Sparkles, Wand2 } from "lucide-react";
import Panel from "../layout/Panel";
import MetricBadge from "../shared/MetricBadge";
import EmptyState from "../shared/EmptyState";
import RitualCalendar from "../shared/RitualCalendar";
import { getSectionAsset } from "../shared/worldAssets";
import { getDeckIcon, getScreenIcon } from "../shared/worldIcons";
import TrainerCard from "../cards/TrainerCard";

function SanctuaryScreen({
  activeDeck,
  activeDeckItems,
  homeCards,
  portals,
  setView,
  startSession,
  state,
  solvedCount,
  levelProgress,
  ritualHint,
  focusScore,
  customDeckCount,
  favoriteDecks,
  onboardingSteps,
}) {
  const SanctuaryIcon = getScreenIcon("Sanctuary");
  const SanctuaryMedia = getSectionAsset("Sanctuary");
  const CampfireMedia = getSectionAsset("Campfire");
  const ActiveDeckIcon = getDeckIcon(activeDeck?.name);

  return (
    <div className="screen-grid">
      <Panel
        title="Sanctuary"
        subtitle="Start here, choose one path, and let everything else stay quiet."
        icon={SanctuaryIcon}
        media={SanctuaryMedia}
        action={<span className="section-chip">{activeDeck?.count || 0} cards in focus</span>}
      >
        <div className="world-intro">
          <div className="world-story">
            <p className="world-line">
              Tonight&apos;s path leads through <strong>{activeDeck?.name || "Today Ritual"}</strong>. The queue is
              small enough to feel approachable and sharp enough to matter.
            </p>
            <p className="world-line">{ritualHint}</p>
            <div className="active-deck-chip">
              <span className="panel-icon panel-icon-inline" aria-hidden="true">
                <ActiveDeckIcon size={15} />
              </span>
              <strong>{activeDeck?.name || "Today Ritual"}</strong>
              <span>{activeDeck?.description || "Start with the cards due now."}</span>
            </div>
            <div className="hero-actions">
              <button className="button button-primary" type="button" onClick={() => startSession(activeDeck)}>
                <Play size={16} />
                Enter ritual
              </button>
              <button className="button button-ghost" type="button" onClick={() => setView("decks")}>
                <Archive size={16} />
                Explore decks
              </button>
            </div>
            <div className="onboarding-card">
              <div className="onboarding-card-head">
                <strong>{state.game.totalReviews < 5 ? "Launchpad" : "Momentum Check"}</strong>
                <span>{state.items.length ? "Starter cards are already waiting for you." : "The studio is quiet until you add the first card."}</span>
              </div>
              <div className="launchpad-list">
                {onboardingSteps.map((step) => (
                  <article className={`launchpad-row ${step.done ? "is-done" : ""}`} key={step.id}>
                    <div className="launchpad-copy">
                      <span className="launchpad-status">
                        {step.done ? <CheckCircle2 size={14} /> : <Sparkles size={14} />}
                        {step.done ? "Complete" : "Next step"}
                      </span>
                      <strong>{step.title}</strong>
                      <span>{step.description}</span>
                    </div>
                    <button
                      className="button button-ghost is-compact"
                      type="button"
                      onClick={() => {
                        if (step.id === "ritual") {
                          startSession(activeDeck);
                          return;
                        }
                        setView(step.view);
                      }}
                    >
                      {step.action}
                      <ArrowRight size={15} />
                    </button>
                  </article>
                ))}
              </div>
              <div className="onboarding-meta">
                <span>{customDeckCount ? `${customDeckCount} custom deck${customDeckCount === 1 ? "" : "s"} shaped so far.` : "Create one custom deck to make the space feel yours."}</span>
                <button className="button button-secondary is-compact" type="button" onClick={() => setView("decks")}>
                  <Wand2 size={15} />
                  Open deck studio
                </button>
              </div>
            </div>
          </div>
          <div className="portal-grid">
            {portals.map((portal) => (
              (() => {
                const PortalIcon = getScreenIcon(portal.title);
                return (
                  <button
                    key={portal.id}
                    type="button"
                    className={`portal-card portal-${portal.tone}`}
                    onClick={() => setView(portal.id)}
                  >
                    <span className="portal-meta">
                      <span className="portal-icon" aria-hidden="true">
                        <PortalIcon size={14} />
                      </span>
                      {portal.stat}
                    </span>
                    <strong>{portal.title}</strong>
                    <p>{portal.description}</p>
                  </button>
                );
              })()
            ))}
          </div>
        </div>

        <div className="card-row">
          {homeCards.length ? (
            homeCards.map((item, index) => (
              <TrainerCard
                key={item.id}
                item={{
                  ...item,
                  dueDate: item.dueDate || item.srs?.nextReview || "-",
                }}
                variant="work"
                badge={index === 0 ? "Next Card" : `#${index + 1}`}
                footer={
                  <button className="button button-ghost" type="button" onClick={() => startSession(activeDeck)}>
                    <Play size={16} />
                    Review in session
                  </button>
                }
              />
            ))
          ) : (
            <EmptyState text="No cards in this ritual yet. Choose another deck or add cards from Library." />
          )}
        </div>
      </Panel>

      {favoriteDecks.length ? (
        <Panel
          title="Pinned Paths"
          subtitle="Your favorite decks stay close to Sanctuary so returning feels effortless."
          action={<span className="section-chip">{favoriteDecks.length} pinned</span>}
        >
          <div className="card-row compact-card-row">
            {favoriteDecks.map((deck) => (
              <TrainerCard
                key={deck.id}
                item={{
                  title: deck.name,
                  category: "Favorite Deck",
                  description: deck.copy,
                  dueDate: `${deck.count} cards`,
                  status: deck.mood,
                  tone: deck.tone,
                  srs: { interval: deck.estimatedMinutes || 2 },
                }}
                variant="deck"
                badge="Pinned"
                footer={
                  <button className="button button-primary is-compact" type="button" onClick={() => startSession(deck)}>
                    <Play size={16} />
                    Enter
                  </button>
                }
              />
            ))}
          </div>
        </Panel>
      ) : null}

      <Panel
        title="Campfire"
        subtitle="Just enough signal to keep your rhythm."
        media={CampfireMedia}
        action={<span className="section-chip">{state.game.unlocked.length} unlocked</span>}
      >
        <div className="metrics-strip">
          <MetricBadge label="Focus" value={focusScore} />
          <MetricBadge label="Level" value={state.game.level} />
          <MetricBadge label="XP" value={state.game.xp} />
          <MetricBadge label="Solved" value={`${solvedCount}/75`} />
        </div>
        <div className="progress-section">
          <div className="progress-caption">
            <span>Level progress</span>
            <span>{levelProgress}%</span>
          </div>
          <div className="progress-track">
            <span style={{ width: `${levelProgress}%` }} />
          </div>
        </div>
        <div className="metrics-strip">
          <MetricBadge label="Deck" value={activeDeck?.name || "None"} />
          <MetricBadge label="Cards ready" value={activeDeckItems.length} />
          <MetricBadge label="Streak" value={`${state.game.streak}d`} />
          <MetricBadge label="Coins" value={state.game.coins} />
        </div>
        <RitualCalendar history={state.game.history} streak={state.game.streak} />
      </Panel>
    </div>
  );
}

export default SanctuaryScreen;
