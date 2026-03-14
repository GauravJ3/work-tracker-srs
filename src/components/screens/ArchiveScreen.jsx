import { CheckCircle2, ExternalLink, FolderPlus } from "lucide-react";
import Panel from "../layout/Panel";
import { getSectionAsset } from "../shared/worldAssets";
import { getDeckIcon, getScreenIcon } from "../shared/worldIcons";
import TrainerCard from "../cards/TrainerCard";
import TrainerCardHeader from "../cards/TrainerCardHeader";
import { deckSigil, difficultyTone } from "../cards/TrainerCard";

function ArchiveScreen({
  state,
  itemForm,
  setItemForm,
  addManualTask,
  selectedCustomDeck,
  removeTrackedItemFromDeck,
  addTrackedItemToDeck,
  completeItem,
  libraryMode,
  setLibraryMode,
  filters,
  setFilters,
  blindCategories,
  filteredBlind,
  addBlindItem,
  toggleSolved,
}) {
  const ArchiveIcon = getScreenIcon("Archive");
  const ArchiveMedia = getSectionAsset("Archive");
  const SelectedDeckIcon = getDeckIcon(selectedCustomDeck?.name);

  return (
    <div className="screen-grid">
      <Panel
        title="Archive"
        subtitle="Browse, refine, and route cards into the right deck."
        icon={ArchiveIcon}
        media={ArchiveMedia}
        action={<span className="section-chip">{state.items.length} cards</span>}
      >
        {selectedCustomDeck ? (
          <div className="active-deck-chip active-deck-chip-quiet">
            <span className="panel-icon panel-icon-inline" aria-hidden="true">
              <SelectedDeckIcon size={15} />
            </span>
            <strong>{selectedCustomDeck.name}</strong>
            <span>New cards route here when you choose Add to deck.</span>
          </div>
        ) : null}
        <div className="subview-switch">
          <button type="button" className={`subview-chip ${libraryMode === "work" ? "is-active" : ""}`} onClick={() => setLibraryMode("work")}>
            Work Cards
          </button>
          <button type="button" className={`subview-chip ${libraryMode === "blind" ? "is-active" : ""}`} onClick={() => setLibraryMode("blind")}>
            Blind Cards
          </button>
        </div>

        {libraryMode === "work" ? (
          <>
            <form className="quick-add" onSubmit={addManualTask}>
              <input
                placeholder="Task or topic"
                value={itemForm.title}
                onChange={(event) => setItemForm((current) => ({ ...current, title: event.target.value }))}
              />
              <input
                placeholder="Category"
                value={itemForm.category}
                onChange={(event) => setItemForm((current) => ({ ...current, category: event.target.value }))}
              />
              <button className="button button-primary" type="submit">
                <FolderPlus size={16} />
                Add card
              </button>
            </form>
            <div className="card-row">
              {state.items.slice(0, 16).map((item) => {
                const done = /done|complete/i.test(item.status);
                const inDeck = selectedCustomDeck?.itemIds.includes(item.id);
                return (
                  <TrainerCard
                    key={item.id}
                    item={{
                      ...item,
                      dueDate: item.dueDate || item.srs?.nextReview || "-",
                    }}
                    badge={item.source}
                    footer={
                      <div className="card-actions">
                        {!done ? (
                          <button className="button button-ghost" type="button" onClick={() => completeItem(item.id)}>
                            <CheckCircle2 size={16} />
                            Complete
                          </button>
                        ) : null}
                        {selectedCustomDeck ? (
                          inDeck ? (
                            <button
                              className="button button-ghost"
                              type="button"
                              onClick={() => removeTrackedItemFromDeck(selectedCustomDeck.id, item.id)}
                            >
                              Remove from deck
                            </button>
                          ) : (
                            <button
                              className="button button-ghost"
                              type="button"
                              onClick={() => addTrackedItemToDeck(selectedCustomDeck.id, item.id)}
                            >
                              <FolderPlus size={16} />
                              Add to {selectedCustomDeck.name}
                            </button>
                          )
                        ) : null}
                      </div>
                    }
                  />
                );
              })}
            </div>
          </>
        ) : null}

        {libraryMode === "blind" ? (
          <>
            <div className="panel-inline-head">
              <span className="section-chip">{filteredBlind.length} matches</span>
            </div>
            <div className="quick-add quick-add-filters">
              <input
                placeholder="Search prompts"
                value={filters.search}
                onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
              />
              <select
                value={filters.category}
                onChange={(event) => setFilters((current) => ({ ...current, category: event.target.value }))}
              >
                {blindCategories.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
              <select
                value={filters.difficulty}
                onChange={(event) => setFilters((current) => ({ ...current, difficulty: event.target.value }))}
              >
                {["All difficulty", "Easy", "Medium", "Hard"].map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </div>
            <div className="card-row">
              {filteredBlind.slice(0, 10).map((item) => {
                const tracked = state.items.some((entry) => entry.blindId === item.id);
                const solved = state.game.solvedBlind.includes(item.id);
                const href = item.premium && state.settings.preferAltLinks ? item.alt : item.link;
                return (
                  <article className="trainer-card" key={item.id}>
                    <TrainerCardHeader tag={item.category} type={item.difficulty} />
                    <div className={`trainer-art art-${difficultyTone(item.difficulty)}`}>
                      <div className="trainer-sigil">{deckSigil(item.title)}</div>
                    </div>
                    <div className="trainer-name-row">
                      <strong>
                        <a href={href} target="_blank" rel="noreferrer">
                          {item.title}
                          <ExternalLink size={14} className="inline-icon" />
                        </a>
                      </strong>
                      <span className="trainer-hp">{solved ? "Solved" : tracked ? "Tracked" : "Wild"}</span>
                    </div>
                    <div className="trainer-info">
                      <div>
                        <span>Status</span>
                        <b>{solved ? "Captured in your trainer log." : "Ready to add to your ritual."}</b>
                      </div>
                    </div>
                    <div className="card-actions">
                      <button className="button button-ghost" type="button" onClick={() => addBlindItem(item)}>
                        <FolderPlus size={16} />
                        {tracked ? "Track again" : "Track"}
                      </button>
                      {selectedCustomDeck ? (
                        <button className="button button-ghost" type="button" onClick={() => addBlindItem(item, selectedCustomDeck.id)}>
                          <FolderPlus size={16} />
                          Add to deck
                        </button>
                      ) : null}
                      <button className="button button-primary" type="button" disabled={solved} onClick={() => toggleSolved(item.id)}>
                        <CheckCircle2 size={16} />
                        {solved ? "Solved" : "Mark solved"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        ) : null}
      </Panel>
    </div>
  );
}

export default ArchiveScreen;
