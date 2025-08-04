import { render, screen, fireEvent } from "@testing-library/react";
import AziendaList from "../AziendaList";
import { Azienda } from "../../../../models/azienda";

const aziende: Azienda[] = [
  {
    id: "did:123",
    name: "ACME Srl",
    legalInfo: { vat: "IT1234567890" },
    seed: "",
    creators: [],
    operatori: [],
    macchinari: [],
    vcIds: []
  },
  {
    id: "did:456",
    name: "Beta SpA",
    legalInfo: { vat: "IT0987654321" },
    seed: "",
    creators: [],
    operatori: [],
    macchinari: [],
    vcIds: []
  },
];

describe("AziendaList", () => {
  it("renderizza le aziende correttamente", () => {
    render(<AziendaList aziende={aziende} />);
    expect(screen.getByText("ACME Srl")).toBeInTheDocument();
    expect(screen.getByText("Beta SpA")).toBeInTheDocument();
    expect(screen.getByText("IT1234567890")).toBeInTheDocument();
    expect(screen.getByText("IT0987654321")).toBeInTheDocument();
  });

  it("mostra il messaggio se la lista è vuota", () => {
    render(<AziendaList aziende={[]} />);
    expect(screen.getByText(/nessuna azienda/i)).toBeInTheDocument();
  });

  it("chiama onSelect quando clicchi Dettagli", () => {
    const onSelect = jest.fn();
    render(<AziendaList aziende={aziende} onSelect={onSelect} />);
    fireEvent.click(screen.getAllByText("Dettagli")[0]);
    expect(onSelect).toHaveBeenCalledWith(aziende[0]);
  });

  it("chiama onDelete quando clicchi Elimina", () => {
    const onDelete = jest.fn();
    render(<AziendaList aziende={aziende} onDelete={onDelete} />);
    fireEvent.click(screen.getAllByText("Elimina")[1]);
    expect(onDelete).toHaveBeenCalledWith(aziende[1].id);
  });
});
