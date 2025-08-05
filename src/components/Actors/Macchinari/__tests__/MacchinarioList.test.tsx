import { render, screen, fireEvent, within } from "@testing-library/react";
import MacchinarioList from "../MacchinarioList";
import { Actor } from "../../../../models/actor";

const macchinari: Actor[] = [
  {
    id: "did:macchinario:1",
    did: "did:macchinario:1",
    name: "Robot KUKA",
    role: "macchinario",
    seed: "SEED_MAC1",
    publicKey: "PUB_MAC1",
    aziendaId: "did:azienda:1",
    createdAt: "2024-01-15",
    updatedAt: "2024-02-01",
    vcIds: ["vc-mac-1", "vc-mac-2"],
  },
  {
    id: "did:macchinario:2",
    did: "did:macchinario:2",
    name: "Linea SMT",
    role: "macchinario",
    seed: "SEED_MAC2",
    publicKey: "PUB_MAC2",
    aziendaId: "did:azienda:1",
    createdAt: "2024-01-16",
    updatedAt: "2024-02-02",
    vcIds: [],
  },
];

describe("MacchinarioList", () => {
  it("mostra tutti i macchinari in lista", () => {
    render(<MacchinarioList macchinari={macchinari} />);
    expect(screen.getByText("Robot KUKA")).toBeInTheDocument();
    expect(screen.getByText("Linea SMT")).toBeInTheDocument();
    // Controlla che la DID appaia una volta per ogni elemento
    expect(screen.getByText("DID: did:macchinario:1")).toBeInTheDocument();
    expect(screen.getByText("DID: did:macchinario:2")).toBeInTheDocument();
  });

  it("mostra i dettagli quando clicchi su un macchinario", () => {
    render(<MacchinarioList macchinari={macchinari} />);
    fireEvent.click(screen.getByText("Robot KUKA"));
    expect(screen.getByText("Dettagli Macchinario")).toBeInTheDocument();
    const vcDiv = screen.getByText(/VC associate:/).parentElement;
    expect(vcDiv).not.toBeNull();
    expect(within(vcDiv!).getByText("2")).toBeInTheDocument();
    expect(screen.getByText("SEED_MAC1")).toBeInTheDocument();
    expect(screen.getByText("PUB_MAC1")).toBeInTheDocument();
    expect(screen.getByText("did:macchinario:1")).toBeInTheDocument();
  });

  it("chiama onCopySeed quando premi il bottone", () => {
  const onCopySeed = jest.fn();
  render(<MacchinarioList macchinari={macchinari} onCopySeed={onCopySeed} />);
  const copyBtn = screen.getAllByText("Copia seed")[0];
  fireEvent.click(copyBtn);
  expect(onCopySeed).toHaveBeenCalledWith("SEED_MAC1");
  });
});