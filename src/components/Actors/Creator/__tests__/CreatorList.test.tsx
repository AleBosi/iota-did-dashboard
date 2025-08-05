import { render, screen, fireEvent, within } from "@testing-library/react";
import CreatorList from "../CreatorList";
import { Actor } from "../../../../models/actor";

const creators: Actor[] = [
  {
    id: "did:creator:1",
    did: "did:creator:1",
    name: "Mario Rossi",
    role: "creator",
    seed: "SEED1",
    publicKey: "PUB1",
    aziendaId: "did:azienda:1",
    createdAt: "2024-01-01",
    updatedAt: "2024-02-02",
    vcIds: ["vc1", "vc2"],
  },
  {
    id: "did:creator:2",
    did: "did:creator:2",
    name: "Luca Bianchi",
    role: "creator",
    seed: "SEED2",
    publicKey: "PUB2",
    aziendaId: "did:azienda:1",
    createdAt: "2024-01-05",
    updatedAt: "2024-02-10",
    vcIds: [],
  },
];

describe("CreatorList", () => {
  it("mostra tutti i creator in lista", () => {
    render(<CreatorList creators={creators} />);
    expect(screen.getByText("Mario Rossi")).toBeInTheDocument();
    expect(screen.getByText("Luca Bianchi")).toBeInTheDocument();
  });

  it("mostra i dettagli quando clicchi su un creator", () => {
    render(<CreatorList creators={creators} />);
    fireEvent.click(screen.getByText("Mario Rossi"));
    expect(screen.getByText("Dettagli Creator")).toBeInTheDocument();

    const vcDiv = screen.getByText(/VC associate:/).parentElement;
    expect(vcDiv).not.toBeNull();
    expect(within(vcDiv!).getByText("2")).toBeInTheDocument();

    expect(screen.getByText("SEED1")).toBeInTheDocument();
    expect(screen.getByText("PUB1")).toBeInTheDocument();
    // Qui la correzione!
    const dids = screen.getAllByText("did:creator:1");
    expect(dids.length).toBeGreaterThanOrEqual(2);
  });

  it("chiama onCopySeed quando premi il bottone", () => {
    const onCopySeed = jest.fn();
    render(<CreatorList creators={creators} onCopySeed={onCopySeed} />);
    const copyBtn = screen.getAllByText("Copia seed")[0];
    fireEvent.click(copyBtn);
    expect(onCopySeed).toHaveBeenCalledWith("SEED1");
  });
});
