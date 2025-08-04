import { render, screen, fireEvent } from "@testing-library/react";
import EventModal from "../EventModal";

describe("EventModal", () => {
  const nodeIds = ["n1", "n2"];
  const types: any[] = [];
  const bom: any[] = [];
  const onSave = jest.fn();
  const onCancel = jest.fn();

  beforeEach(() => {
    onSave.mockClear();
    onCancel.mockClear();
  });

  it("renderizza titolo, textarea, e pulsanti", () => {
    render(<EventModal nodeIds={nodeIds} types={types} bom={bom} onSave={onSave} onCancel={onCancel} />);
    expect(screen.getByText(/aggiungi evento/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/descrizione evento/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /salva/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /annulla/i })).toBeInTheDocument();
  });

  it("chiama onSave con dati evento al submit", () => {
    render(<EventModal nodeIds={nodeIds} types={types} bom={bom} onSave={onSave} onCancel={onCancel} />);
    fireEvent.change(screen.getByPlaceholderText(/descrizione evento/i), { target: { value: "Evento test" } });
    fireEvent.click(screen.getByRole("button", { name: /salva/i }));
    expect(onSave).toHaveBeenCalled();
    const [savedNodeIds, event] = onSave.mock.calls[0];
    expect(savedNodeIds).toEqual(nodeIds);
    expect(event.descr).toBe("Evento test");
    expect(event.date).toMatch(/^\d{4}-\d{2}-\d{2}T/); // ISO date
    expect(typeof event.id).toBe("string");
  });

  it("mostra alert se descrizione è vuota e non chiama onSave", () => {
    window.alert = jest.fn(); // Mock alert
    render(<EventModal nodeIds={nodeIds} types={types} bom={bom} onSave={onSave} onCancel={onCancel} />);
    fireEvent.click(screen.getByRole("button", { name: /salva/i }));
    expect(window.alert).toHaveBeenCalledWith("Inserisci una descrizione evento");
    expect(onSave).not.toHaveBeenCalled();
  });

  it("chiama onCancel al click su Annulla", () => {
    render(<EventModal nodeIds={nodeIds} types={types} bom={bom} onSave={onSave} onCancel={onCancel} />);
    fireEvent.click(screen.getByRole("button", { name: /annulla/i }));
    expect(onCancel).toHaveBeenCalled();
  });
});
