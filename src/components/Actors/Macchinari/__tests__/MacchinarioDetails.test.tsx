import { render, screen } from "@testing-library/react";
import MacchinarioDetails from "../MacchinarioDetails";
import { Actor } from "../../../../models/actor";

const macchinario: Actor = {
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
};

describe("MacchinarioDetails", () => {
  it("mostra tutti i dettagli del macchinario", () => {
    render(<MacchinarioDetails macchinario={macchinario} />);
    expect(screen.getByText("Dettagli Macchinario")).toBeInTheDocument();
    expect(screen.getByText("Robot KUKA")).toBeInTheDocument();
    expect(screen.getByText("macchinario")).toBeInTheDocument();
    // Cerca solo la DID una sola volta!
    expect(screen.getByText("did:macchinario:1")).toBeInTheDocument();
    expect(screen.getByText("SEED_MAC1")).toBeInTheDocument();
    expect(screen.getByText("PUB_MAC1")).toBeInTheDocument();
    expect(screen.getByText("did:azienda:1")).toBeInTheDocument();
    // Verifica VC associate
    const vcDiv = screen.getByText(/VC associate:/).parentElement;
    expect(vcDiv).not.toBeNull();
    expect(vcDiv?.querySelector("span")).toHaveTextContent("2");
    expect(screen.getByText(/Creato il:/)).toBeInTheDocument();
    expect(screen.getByText(/Aggiornato il:/)).toBeInTheDocument();
  });

  it("non esplode se mancano proprietà opzionali", () => {
    const minimal: Actor = { id: "id", did: "id", name: "NomeMacch", role: "macchinario", vcIds: [] };
    render(<MacchinarioDetails macchinario={minimal} />);
    expect(screen.getByText("NomeMacch")).toBeInTheDocument();
    expect(screen.getByText("macchinario")).toBeInTheDocument();
    expect(screen.getByText("id")).toBeInTheDocument();
  });

  it("non renderizza nulla se macchinario è null", () => {
    const { container } = render(<MacchinarioDetails macchinario={null as any} />);
    expect(container.firstChild).toBeNull();
  });
});
