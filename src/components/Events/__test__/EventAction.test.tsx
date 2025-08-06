import { render, screen, fireEvent } from "@testing-library/react";
import EventAction from "../EventAction";

// Mock completo del tipo Event
const mockEvent = {
  id: "evt1",
  type: "Produzione",
  description: "Avvia la macchina per il lotto X",
  productId: "prod-001",
  operatoreId: "op-123",
  macchinarioId: "mac-456",
  creatorId: "creator-999",
  date: "2025-08-05T12:00:00Z",
  done: false
};

describe("EventAction component", () => {
  it("visualizza tipo e descrizione evento", () => {
    render(<EventAction event={mockEvent} onExecute={() => {}} />);
    expect(screen.getByText("Produzione")).toBeInTheDocument();
    expect(screen.getByText(/Avvia la macchina/)).toBeInTheDocument();
  });

  it("mostra il bottone se l'evento NON è fatto", () => {
    render(<EventAction event={mockEvent} onExecute={() => {}} />);
    expect(screen.getByText("Esegui evento")).toBeInTheDocument();
    expect(screen.queryByText("Completato")).toBeNull();
  });

  it("NON mostra il bottone e mostra 'Completato' se event.done = true", () => {
    render(<EventAction event={{ ...mockEvent, done: true }} onExecute={() => {}} />);
    expect(screen.queryByText("Esegui evento")).toBeNull();
    expect(screen.getByText("Completato")).toBeInTheDocument();
  });

  it("chiama onExecute con l'id dell'evento quando clicchi il bottone", () => {
    const onExecute = jest.fn();
    render(<EventAction event={mockEvent} onExecute={onExecute} />);
    fireEvent.click(screen.getByText("Esegui evento"));
    expect(onExecute).toHaveBeenCalledWith("evt1");
  });

  it("snapshot del componente", () => {
    const { asFragment } = render(<EventAction event={mockEvent} onExecute={() => {}} />);
    expect(asFragment()).toMatchSnapshot();
  });
});
