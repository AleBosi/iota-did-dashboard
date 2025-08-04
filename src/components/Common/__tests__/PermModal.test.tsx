import { render, screen, fireEvent } from "@testing-library/react";
import PermModal from "../PermModal";

describe("PermModal", () => {
  const members = [
    { did: "did:1", name: "Alice", role: "Creator" },
    { did: "did:2", name: "Bob", role: "Operatore" },
    { did: "did:3", matricola: "M-42", role: "Macchinario" },
  ];
  const nodeIds = ["n1", "n2"];
  const bom: any[] = [];
  const onSave = jest.fn();
  const onCancel = jest.fn();

  beforeEach(() => {
    onSave.mockClear();
    onCancel.mockClear();
  });

  it("mostra il titolo e tutti i membri con i dati corretti", () => {
    render(<PermModal nodeIds={nodeIds} members={members} bom={bom} onSave={onSave} onCancel={onCancel} />);
    expect(screen.getByText(/gestisci permessi/i)).toBeInTheDocument();
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
    expect(screen.getByText(/M-42/)).toBeInTheDocument(); // matricola macchinario
    expect(screen.getByText("(did:1)")).toBeInTheDocument();
    expect(screen.getByText("(did:2)")).toBeInTheDocument();
    expect(screen.getByText("(did:3)")).toBeInTheDocument();
    expect(screen.getAllByRole("checkbox")).toHaveLength(3);
  });

  it("abilita/disabilita permessi selezionando le checkbox", () => {
    render(<PermModal nodeIds={nodeIds} members={members} bom={bom} onSave={onSave} onCancel={onCancel} />);
    const cbxAlice = screen.getAllByRole("checkbox")[0];
    expect(cbxAlice).not.toBeChecked();

    // Seleziona Alice
    fireEvent.click(cbxAlice);
    expect(cbxAlice).toBeChecked();

    // Deseleziona Alice
    fireEvent.click(cbxAlice);
    expect(cbxAlice).not.toBeChecked();
  });

  it("chiama onSave con i permessi selezionati al submit", () => {
    render(<PermModal nodeIds={nodeIds} members={members} bom={bom} onSave={onSave} onCancel={onCancel} />);
    const cbxAlice = screen.getAllByRole("checkbox")[0];
    const cbxBob = screen.getAllByRole("checkbox")[1];
    fireEvent.click(cbxAlice);
    fireEvent.click(cbxBob);

    fireEvent.click(screen.getByRole("button", { name: /salva/i }));

    expect(onSave).toHaveBeenCalledWith(nodeIds, ["did:1", "did:2"]);
  });

  it("chiama onCancel al click su Annulla", () => {
    render(<PermModal nodeIds={nodeIds} members={members} bom={bom} onSave={onSave} onCancel={onCancel} />);
    fireEvent.click(screen.getByRole("button", { name: /annulla/i }));
    expect(onCancel).toHaveBeenCalled();
  });

  it("visualizza (no matricola) o (senza nome) se manca name o matricola", () => {
    const testMembers = [
      { did: "did:4", role: "Macchinario" },           // niente matricola
      { did: "did:5" },                                // niente name
    ];
    render(<PermModal nodeIds={nodeIds} members={testMembers} bom={bom} onSave={onSave} onCancel={onCancel} />);
    expect(screen.getByText("(no matricola)")).toBeInTheDocument();
    expect(screen.getByText("(senza nome)")).toBeInTheDocument();
  });
});
