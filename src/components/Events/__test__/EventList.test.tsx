import { render, screen, fireEvent } from "@testing-library/react";
import EventList from "../EventList";
import { Event } from "../../../models/event";
import { Actor } from "../../../models/actor";

// Mocks
const actors: Actor[] = [
  {
    id: "op-1",
    did: "did:example:op-1",
    name: "Anna Op",
    role: "operatore",
  },
  {
    id: "mac-1",
    did: "did:example:mac-1",
    name: "Mac1",
    role: "macchinario",
  },
  {
    id: "op-2",
    did: "did:example:op-2",
    name: "Bob Op",
    role: "operatore",
  },
  {
    id: "mac-2",
    did: "did:example:mac-2",
    name: "Mac2",
    role: "macchinario",
  },
];

const mockEvents: Event[] = [
  {
    id: "evt-1",
    type: "avvio",
    description: "Avvio macchina A",
    productId: "prod-1",
    operatoreId: "op-1",
    macchinarioId: "mac-1",
    creatorId: "did:admin",
    date: "2025-08-01T10:00:00Z",
    done: false,
  },
  {
    id: "evt-2",
    type: "manutenzione",
    description: "Sostituzione filtro",
    productId: "prod-2",
    operatoreId: "op-2",
    macchinarioId: "mac-2",
    creatorId: "did:admin",
    date: "2025-08-02T15:30:00Z",
    bomComponent: "filtro-aria",
    done: true,
  },
];

describe("EventList component", () => {
  it("renderizza tutti gli eventi come lista", () => {
    render(<EventList events={mockEvents} actors={actors} />);
    expect(screen.getByText("avvio")).toBeInTheDocument();
    expect(screen.getByText("Avvio macchina A")).toBeInTheDocument();
    expect(screen.getByText("manutenzione")).toBeInTheDocument();
    expect(screen.getByText("Sostituzione filtro")).toBeInTheDocument();
    expect(screen.getByText((t) => t.includes("Anna Op"))).toBeInTheDocument();
    expect(screen.getByText((t) => t.includes("Mac1"))).toBeInTheDocument();
    expect(screen.getByText((t) => t.includes("Bob Op"))).toBeInTheDocument();
    expect(screen.getByText((t) => t.includes("Mac2"))).toBeInTheDocument();
  });

  it("visualizza bomComponent se presente", () => {
    render(<EventList events={mockEvents} actors={actors} />);
    expect(screen.getByText("[filtro-aria]")).toBeInTheDocument();
  });

  it("applica stile line-through e ✓ se done è true", () => {
    render(<EventList events={mockEvents} actors={actors} />);
    const manutenzioneLi = screen.getByText("manutenzione").closest("li");
    expect(manutenzioneLi).toHaveClass("line-through");
    expect(screen.getByText("✓")).toBeInTheDocument();
  });

  it("mostra EventDetails al click su un evento", () => {
    render(<EventList events={mockEvents} actors={actors} />);
    fireEvent.click(screen.getByText("avvio"));
    expect(screen.getByText(/ID evento:/i)).toBeInTheDocument();
    expect(screen.getByText("evt-1")).toBeInTheDocument();
    // Usa getAllByText: può essere presente sia nella lista che nei dettagli
    expect(screen.getAllByText((t) => t.includes("Anna Op")).length).toBeGreaterThan(0);
    expect(screen.getAllByText((t) => t.includes("Mac1")).length).toBeGreaterThan(0);
  });

  it("chiama onSelect quando un evento viene selezionato", () => {
    const onSelect = jest.fn();
    render(<EventList events={mockEvents} actors={actors} onSelect={onSelect} />);
    fireEvent.click(screen.getByText("manutenzione"));
    expect(onSelect).toHaveBeenCalledWith(mockEvents[1]);
  });

  it("snapshot", () => {
    const { asFragment } = render(<EventList events={mockEvents} actors={actors} />);
    expect(asFragment()).toMatchSnapshot();
  });
});
