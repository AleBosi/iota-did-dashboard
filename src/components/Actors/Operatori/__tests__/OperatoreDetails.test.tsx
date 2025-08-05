import { render, screen } from "@testing-library/react";
import OperatoreDetails from "../OperatoreDetails";
import { Actor } from "../../../../models/actor";

const operatore: Actor = {
  id: "did:operatore:1",
  did: "did:operatore:1",
  name: "Giovanni Verdi",
  role: "operatore",
  seed: "SEED_OP1",
  publicKey: "PUB_OP1",
  aziendaId: "did:azienda:1",
  createdAt: "2024-01-10",
  updatedAt: "2024-02-01",
  vcIds: ["vc-op-1"],
};

describe("OperatoreDetails", () => {
  it("mostra tutti i dettagli dell'operatore", () => {
    render(<OperatoreDetails operatore={operatore} />);
    expect(screen.getByText("Dettagli Operatore")).toBeInTheDocument();
    expect(screen.getByText("Giovanni Verdi")).toBeInTheDocument();
    expect(screen.getByText("operatore")).toBeInTheDocument();
    expect(screen.getByText("did:operatore:1")).toBeInTheDocument();
    expect(screen.getByText("SEED_OP1")).toBeInTheDocument();
    expect(screen.getByText("PUB_OP1")).toBeInTheDocument();
    expect(screen.getByText("did:azienda:1")).toBeInTheDocument();
    // Verifica VC associate
    const vcDiv = screen.getByText(/VC associate:/).parentElement;
    expect(vcDiv).not.toBeNull();
    expect(vcDiv?.querySelector("span")).toHaveTextContent("1");
    expect(screen.getByText(/Creato il:/)).toBeInTheDocument();
    expect(screen.getByText(/Aggiornato il:/)).toBeInTheDocument();
  });

  it("non esplode se mancano proprietà opzionali", () => {
    const minimal: Actor = { id: "id", did: "id", name: "Nome", role: "operatore", vcIds: [] };
    render(<OperatoreDetails operatore={minimal} />);
    expect(screen.getByText("Nome")).toBeInTheDocument();
    expect(screen.getByText("operatore")).toBeInTheDocument();
  });

  it("non renderizza nulla se operatore è null", () => {
    const { container } = render(<OperatoreDetails operatore={null as any} />);
    expect(container.firstChild).toBeNull();
  });
});
