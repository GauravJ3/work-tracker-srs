import { Archive, FolderPlus } from "lucide-react";
import Panel from "../layout/Panel";
import EmptyState from "../shared/EmptyState";
import { getSectionAsset } from "../shared/worldAssets";
import { getDeckIcon, getScreenIcon } from "../shared/worldIcons";
import TrainerCardHeader from "../cards/TrainerCardHeader";
import { deckSigil } from "../cards/TrainerCard";

function DeckGardenScreen({
  ritualThemes,
  activeThemeId,
  updateSettings,
  allDecks,
  activeDeckId,
  selectDeck,
  deckForm,
  setDeckForm,
  createDeck,
  customDecks,
  hydrateCustomDeck,
  state,
  selectedCustomDeck,
  removeDeck,
}) {
  const DeckGardenIcon = getScreenIcon("Deck Garden");
  const DeckGardenMedia = getSectionAsset("Deck Garden");

  return (
    <div className="screen-grid">
      <Panel
        title="Deck Garden"
        subtitle="Choose a ritual mood, then grow your own decks beside the smart ones."
        icon={DeckGardenIcon}
        media={DeckGardenMedia}
        action={<span className="section-chip">{allDecks.length} total decks</span>}
      >
        <div className="theme-picker">
          {ritualThemes.map((theme) => (
            <button
              key={theme.id}
              type="button"
              className={`theme-card ${activeThemeId === theme.id ? "is-active" : ""}`}
              onClick={() => updateSettings({ ritualTone: theme.id })}
            >
              <strong>{theme.name}</strong>
              <span>{theme.copy}</span>
            </button>
          ))}
        </div>
        <div className="card-row">
          {allDecks.map((deck) => (
            (() => {
              const DeckIcon = getDeckIcon(deck.name);
              return (
                <button
                  key={deck.id}
                  type="button"
                  className={`trainer-card trainer-card-button ${activeDeckId === deck.id ? "is-selected" : ""}`}
                  onClick={() => selectDeck(deck.id)}
                >
                  <TrainerCardHeader tag={deck.kind === "custom" ? "Custom Deck" : "Smart Deck"} type={deck.count} />
                  <div className={`trainer-art art-${deck.tone || "sun"}`}>
                    <div className="trainer-sigil">{deckSigil(deck.name)}</div>
                    <span className="trainer-art-icon" aria-hidden="true">
                      <DeckIcon size={18} />
                    </span>
                  </div>
                  <div className="trainer-name-row">
                    <strong>
                      <span className="trainer-name-icon" aria-hidden="true">
                        <DeckIcon size={16} />
                      </span>
                      {deck.name}
                    </strong>
                    <span className="trainer-hp">{deck.count} cards</span>
                  </div>
                  <div className="trainer-info">
                    <div><span>Feel</span><b>{deck.description}</b></div>
                    <div><span>Play</span><b>{deck.copy}</b></div>
                  </div>
                </button>
              );
            })()
          ))}
        </div>
      </Panel>

      <Panel
        title="Forge A Deck"
        subtitle="Name a path, give it a feeling, and it becomes a place you can return to."
        action={<span className="section-chip">{customDecks.length} custom</span>}
      >
        <div className="two-column">
          <form className="builder-form" onSubmit={createDeck}>
            <input
              placeholder="Deck name"
              value={deckForm.name}
              onChange={(event) => setDeckForm((current) => ({ ...current, name: event.target.value }))}
            />
            <textarea
              rows="4"
              placeholder="What is this deck for?"
              value={deckForm.description}
              onChange={(event) => setDeckForm((current) => ({ ...current, description: event.target.value }))}
            />
            <button className="button button-primary" type="submit">
              <FolderPlus size={16} />
              Create deck
            </button>
          </form>
          <div className="stack-list">
            {customDecks.length ? (
              customDecks.map((deck) => {
                const hydrated = hydrateCustomDeck(deck, state.items);
                const selected = selectedCustomDeck?.id === deck.id;
                return (
                  <article className={`list-row ${selected ? "is-selected" : ""}`} key={deck.id}>
                    <button type="button" className="list-row-main" onClick={() => selectDeck(deck.id)}>
                      <strong>{deck.name}</strong>
                      <span>{hydrated.count} cards • {deck.description}</span>
                    </button>
                    <button className="button button-ghost" type="button" onClick={() => removeDeck(deck.id)}>
                      <Archive size={16} />
                      Archive
                    </button>
                  </article>
                );
              })
            ) : (
              <EmptyState text="No custom decks yet. Create one and then start routing cards into it." />
            )}
          </div>
        </div>
      </Panel>
    </div>
  );
}

export default DeckGardenScreen;
