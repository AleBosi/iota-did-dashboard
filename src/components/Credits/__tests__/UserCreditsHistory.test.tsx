import { render, screen } from "@testing-library/react";
import UserCreditsHistory, { CreditHistoryItem } from "../UserCreditsHistory";

const testDID = "did:iota:azienda-1";

const mockHistory: CreditHistoryItem[] = [
  {
    id: "1",
    date: "2025-08-05T12:00:00.000Z",
    from: "did:iota:admin",
    to: "did:iota:azienda-1",
    qty: 50,
    reason: "Acquisto",
  },
  {
    id: "2",
    date: "2025-08-06T16:00:00.000Z",
    from: "did:iota:azienda-1",
    to: "did:iota:op-7",
    qty: -20,
    reason: "Assegnazione",
  },
];

describe("UserCreditsHistory", () => {
  it("visualizza il DID sopra la lista movimenti", () => {
    render(<UserCreditsHistory history={mockHistory} did={testDID} />);
    // Cerca SOLO il div principale col data-testid
    expect(screen.getByTestId("main-did")).toHaveTextContent(`DID: ${testDID}`);
  });

  it("mostra la lista dei movimenti crediti", () => {
    render(<UserCreditsHistory history={mockHistory} did={testDID} />);
    expect(screen.getByText("+50")).toBeInTheDocument();
    expect(screen.getByText("-20")).toBeInTheDocument();
    expect(screen.getByText(/Acquisto/)).toBeInTheDocument();
    expect(screen.getByText(/Assegnazione/)).toBeInTheDocument();
  });

  it("mostra messaggio e DID quando la history è vuota", () => {
    render(<UserCreditsHistory history={[]} did={testDID} />);
    expect(screen.getByText(/Nessun movimento crediti/i)).toBeInTheDocument();
    expect(screen.getByTestId("main-did")).toHaveTextContent(`DID: ${testDID}`);
  });

  it("non esplode se manca il did", () => {
    render(<UserCreditsHistory history={mockHistory} />);
    expect(screen.getByText("+50")).toBeInTheDocument();
    expect(screen.getByText("-20")).toBeInTheDocument();
    // Non deve mostrare la riga DID
    expect(screen.queryByTestId("main-did")).not.toBeInTheDocument();
  });

  it("snapshot", () => {
    const { asFragment } = render(<UserCreditsHistory history={mockHistory} did={testDID} />);
    expect(asFragment()).toMatchSnapshot();
  });
});
