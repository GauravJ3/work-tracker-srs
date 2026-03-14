import { Archive, FolderPlus, PlusSquare, Sparkles } from "lucide-react";
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
  deckCardForm,
  setDeckCardForm,
  addCardToDeck,
  starterCards,
  addStarterCardToDeck,
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
                  className={`trainer-card trainer-card-deck trainer-card-button ${activeDeckId === deck.id ? "is-selected" : ""}`}
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
                    <div><span>Mood</span><b>{deck.mood || deck.description}</b></div>
                    <div><span>Play</span><b>{deck.estimatedMinutes || 2} min ritual</b></div>
                  </div>
                  <div className="deck-meta-strip">
                    <span className={`deck-tone-chip tone-${deck.tone || "sun"}`}>{deck.copy}</span>
                    {deck.lastPlayedAt ? <span className="deck-meta-note">Recently used</span> : <span className="deck-meta-note">{deck.kind === "system" ? "Smart lane" : "Custom lane"}</span>}
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
            <label>
              Ritual mood
              <select
                value={deckForm.tone}
                onChange={(event) => setDeckForm((current) => ({ ...current, tone: event.target.value }))}
              >
                {ritualThemes.map((theme) => (
                  <option key={theme.id} value={theme.id}>
                    {theme.name}
                  </option>
                ))}
              </select>
            </label>
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

      <Panel
        title="Card Studio"
        subtitle="Create a card directly inside the selected deck, or drop in a starter card with one tap."
        action={
          <span className="section-chip">
            {selectedCustomDeck ? selectedCustomDeck.name : "Pick a custom deck first"}
          </span>
        }
      >
        <div className="two-column">
          <form className="builder-form" onSubmit={addCardToDeck}>
            <label>
              Card title
              <input
                placeholder="Example: Review API design notes"
                value={deckCardForm.title}
                onChange={(event) => setDeckCardForm((current) => ({ ...current, title: event.target.value }))}
              />
            </label>
            <label>
              Category
              <input
                placeholder="Work, Study, Interview..."
                value={deckCardForm.category}
                onChange={(event) => setDeckCardForm((current) => ({ ...current, category: event.target.value }))}
              />
            </label>
            <label>
              Note
              <textarea
                rows="4"
                placeholder="Why this card matters in the deck"
                value={deckCardForm.notes}
                onChange={(event) => setDeckCardForm((current) => ({ ...current, notes: event.target.value }))}
              />
            </label>
            <button className="button button-primary" type="submit" disabled={!selectedCustomDeck}>
              <PlusSquare size={16} />
              Add to {selectedCustomDeck?.name || "selected deck"}
            </button>
          </form>

          <div className="stack-list">
            <div className="starter-pack-head">
              <strong>Starter cards</strong>
              <span>Use these to fill a deck quickly and shape the ritual before you customize it.</span>
            </div>
            {starterCards.map((card) => (
              <article className="starter-row" key={card.id}>
                <div className="starter-row-copy">
                  <strong>{card.title}</strong>
                  <span>{card.category} • {card.notes}</span>
                </div>
                <button
                  className="button button-secondary"
                  type="button"
                  disabled={!selectedCustomDeck}
                  onClick={() => addStarterCardToDeck(card)}
                >
                  <Sparkles size={16} />
                  Add
                </button>
              </article>
            ))}
          </div>
        </div>
      </Panel>
    </div>
  );
}

export default DeckGardenScreen;
