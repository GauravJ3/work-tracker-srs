import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import App from "./App";

describe("Work Pulse integration", () => {
  it("shows the starter launchpad on first load", () => {
    render(<App />);

    expect(screen.getByText("Launchpad")).toBeInTheDocument();
    expect(screen.getByText("Complete your first ritual")).toBeInTheDocument();
    expect(screen.getByText("Create a custom deck")).toBeInTheDocument();
    expect(screen.getByText("Route a card into a deck")).toBeInTheDocument();
  });

  it("runs a ritual through intro, reveal, and first answer", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /enter ritual/i }));
    expect(screen.getByText(/prepare the ritual/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /begin ritual/i }));
    expect(screen.getByRole("button", { name: /reveal card details/i })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /reveal card details/i }));
    expect(screen.getByRole("button", { name: /good/i })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /good/i }));
    await waitFor(() => {
      expect(screen.getByText((content) => content.includes("Card 2 of 4"))).toBeInTheDocument();
    });
  });

  it("creates a custom deck and routes a quick card into it from Archive", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /explore decks/i }));
    await user.type(screen.getByPlaceholderText(/deck name/i), "Focus Sprint");
    await user.type(screen.getByPlaceholderText(/what is this deck for\?/i), "High priority sprint cards");
    await user.click(screen.getByRole("button", { name: /create deck/i }));

    expect(screen.getAllByText("Focus Sprint").length).toBeGreaterThan(0);

    const workspaceNav = screen.getByRole("navigation", { name: /workspace views/i });
    await user.click(within(workspaceNav).getByRole("button", { name: /^archive$/i }));
    await user.type(screen.getByPlaceholderText(/task or topic/i), "Close launch loop");
    await user.type(screen.getByPlaceholderText(/^category$/i), "Ops");
    await user.click(screen.getByRole("button", { name: /^add card$/i }));

    await user.click(screen.getByRole("button", { name: /in selected deck/i }));

    const deckCard = screen.getByText("Close launch loop").closest("article");
    expect(deckCard).toBeTruthy();
    expect(within(deckCard).getByText(/ops/i)).toBeInTheDocument();
  });
});
