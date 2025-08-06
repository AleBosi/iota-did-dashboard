import { render, screen } from "@testing-library/react";
import EventDetails from "../EventDetails";
import { Event } from "../../../models/event";
import { Actor } from "../../../models/actor";

const actors: Actor[] = [
  {
    id: "op-11",
    did: "did:example:op-11",
    name: "Mario Operatore",
    role: "operatore",
  },
  {
    id: "mac-22",
    did: "did:example:mac-22",
    name: "Linea Robot",
    role: "macchinario",
  },
];

const baseEvent: Event = {
  id: "evt-001",
  type: "manutenzione",
  description: "Controllo annuale macchina",
  productId: "prod-01",
  operatoreId: "op-11",
  macchinarioId: "mac-22",
  creatorId: "did:creator-xyz",
  date: "2025-08-05T12:00:00Z",
  done: false
};

describe("EventDetails component", () => {
  it("renderizza tutti i campi base obbligatori", () => {
    render(<EventDetails event={baseEvent} actors={actors} />);
    expect(screen.getByText(/ID evento:/i)).toBeInTheDocument();
    expect(screen.getByText("evt-001")).toBeInTheDocument();

    expect(screen.getByText(/Tipo:/i)).toBeInTheDocument();
    expect(screen.getByText("manutenzione")).toBeInTheDocument();

    expect(screen.getByText(/Descrizione:/i)).toBeInTheDocument();
    expect(screen.getByText("Controllo annuale macchina")).toBeInTheDocument();

    expect(screen.getByText(/Prodotto:/i)).toBeInTheDocument();
    expect(screen.getByText("prod-01")).toBeInTheDocument();

    expect(screen.getByText(/Operatore:/i)).toBeInTheDocument();
    expect(screen.getByText("Mario Operatore")).toBeInTheDocument();

    expect(screen.getByText(/Macchinario:/i)).toBeInTheDocument();
    expect(screen.getByText("Linea Robot")).toBeInTheDocument();

    expect(screen.getByText(/Creatore \(DID\):/i)).toBeInTheDocument();
    expect(screen.getByText("did:creator-xyz")).toBeInTheDocument();

    expect(screen.getByText(/Data:/i)).toBeInTheDocument();
    expect(screen.getByText((t) => t.includes("8/5/2025"))).toBeInTheDocument();

    expect(screen.getByText(/Stato:/i)).toBeInTheDocument();
    expect(screen.getByText(/Da eseguire/i)).toBeInTheDocument();
  });

  it("mostra 'Completato' se done è true", () => {
    render(<EventDetails event={{ ...baseEvent, done: true }} actors={actors} />);
    expect(screen.getByText(/Stato:/i)).toBeInTheDocument();
    expect(screen.getByText(/Completato/i)).toBeInTheDocument();
  });

  it("visualizza campo opzionale bomComponent se presente", () => {
    render(<EventDetails event={{ ...baseEvent, bomComponent: "motore-01" }} actors={actors} />);
    expect(screen.getByText(/Componente BOM:/i)).toBeInTheDocument();
    expect(screen.getByText("motore-01")).toBeInTheDocument();
  });

  it("visualizza campo opzionale proofId se presente", () => {
    render(<EventDetails event={{ ...baseEvent, proofId: "vc-555" }} actors={actors} />);
    expect(screen.getByText(/VC principale \(proofId\):/i)).toBeInTheDocument();
    expect(screen.getByText("vc-555")).toBeInTheDocument();
  });

  it("visualizza campo opzionale vcIds se presenti", () => {
    render(<EventDetails event={{ ...baseEvent, vcIds: ["vc-1", "vc-2"] }} actors={actors} />);
    expect(screen.getByText(/VC associate:/i)).toBeInTheDocument();
    expect(screen.getByText("vc-1, vc-2")).toBeInTheDocument();
  });

  it("renderizza null se event è null/undefined", () => {
    const { container } = render(<EventDetails event={undefined as any} actors={actors} />);
    expect(container.firstChild).toBeNull();
  });

  it("snapshot", () => {
    const { asFragment } = render(<EventDetails event={baseEvent} actors={actors} />);
    expect(asFragment()).toMatchSnapshot();
  });
});
