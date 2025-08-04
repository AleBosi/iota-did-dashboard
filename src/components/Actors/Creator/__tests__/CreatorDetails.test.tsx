import { render, screen } from "@testing-library/react";
import CreatorDetails from "../CreatorDetails";
import { Actor } from "../../../../models/actor";

const baseCreator: Actor = {
  id: "did:creator1",
  name: "Mario Rossi",
  role: "creator", // <-- fix qui
  seed: "seed-value",
  publicKey: "pubkey-value",
  aziendaId: "did:azienda123",
  createdAt: "2024-01-01",
  updatedAt: "2024-02-02",
  vcIds: ["vc1", "vc2"],
};

describe("CreatorDetails", () => {
  it("mostra tutti i dettagli del creator", () => {
    render(<CreatorDetails creator={baseCreator} />);
    expect(screen.getByText("Mario Rossi")).toBeInTheDocument();
    expect(screen.getByText("creator")).toBeInTheDocument();
    expect(screen.getByText("did:creator1")).toBeInTheDocument();
    expect(screen.getByText("seed-value")).toBeInTheDocument();
    expect(screen.getByText("pubkey-value")).toBeInTheDocument();
    expect(screen.getByText("did:azienda123")).toBeInTheDocument();
    expect(screen.getByText(/Creato il:/)).toBeInTheDocument();
    expect(screen.getByText(/Aggiornato il:/)).toBeInTheDocument();
  });

  it("non esplode se mancano proprietà opzionali", () => {
    const minimalCreator = { id: "id", name: "Nome", role: "creator" } as Actor; // <-- fix qui
    render(<CreatorDetails creator={minimalCreator} />);
    expect(screen.getByText("Nome")).toBeInTheDocument();
    expect(screen.getByText("creator")).toBeInTheDocument();
  });

  it("non renderizza nulla se creator è null", () => {
    const { container } = render(<CreatorDetails creator={null as any} />);
    expect(container.firstChild).toBeNull();
  });
});
