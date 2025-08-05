import { render, screen, fireEvent, within } from "@testing-library/react";
import OperatoreList from "../OperatoreList";
import { Actor } from "../../../../models/actor";

const operatori: Actor[] = [
  {
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
  },
  {
    id: "did:operatore:2",
    did: "did:operatore:2",
    name: "Anna Blu",
    role: "operatore",
    seed: "SEED_OP2",
    publicKey: "PUB_OP2",
    aziendaId: "did:azienda:1",
    createdAt: "2024-01-11",
    updatedAt: "2024-02-02",
    vcIds: [],
  },
];

describe("OperatoreList", () => {
  it("mostra tutti gli operatori in lista", () => {
    render(<OperatoreList operatori={operatori} />);
    expect(screen.getByText("Giovanni Verdi")).toBeInTheDocument();
    expect(screen.getByText("Anna Blu")).toBeInTheDocument();
  });

  it("mostra i dettagli quando clicchi su un operatore", () => {
    render(<OperatoreList operatori={operatori} />);
    fireEvent.click(screen.getByText("Giovanni Verdi"));
    expect(screen.getByText("Dettagli Operatore")).toBeInTheDocument();
    const vcDiv = screen.getByText(/VC associate:/).parentElement;
    expect(vcDiv).not.toBeNull();
    expect(within(vcDiv!).getByText("1")).toBeInTheDocument();
    expect(screen.getByText("SEED_OP1")).toBeInTheDocument();
    expect(screen.getByText("PUB_OP1")).toBeInTheDocument();
    expect(screen.getByText("did:operatore:1")).toBeInTheDocument();
  });

  it("chiama onCopySeed quando premi il bottone", () => {
    const onCopySeed = jest.fn();
    render(<OperatoreList operatori={operatori} onCopySeed={onCopySeed} />);
    const copyBtn = screen.getAllByText("Copia seed")[0];
    fireEvent.click(copyBtn);
    expect(onCopySeed).toHaveBeenCalledWith("SEED_OP1");
  });
});
