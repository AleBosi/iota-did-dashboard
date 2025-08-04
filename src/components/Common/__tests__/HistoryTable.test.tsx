import { render, screen, fireEvent } from "@testing-library/react";
import HistoryTable, { HistoryRow } from "../HistoryTable";

describe("HistoryTable", () => {
  const sampleRows: HistoryRow[] = [
    { id: "1", date: "2024-08-01", description: "Prima azione" },
    { id: "2", date: "2024-08-02", description: "Seconda azione" },
  ];

  it("renderizza le intestazioni della tabella", () => {
    render(<HistoryTable rows={sampleRows} />);
    expect(screen.getByText(/data/i)).toBeInTheDocument();
    expect(screen.getByText(/descrizione/i)).toBeInTheDocument();
  });

  it("renderizza tutte le righe passate", () => {
    render(<HistoryTable rows={sampleRows} />);
    expect(screen.getByText("2024-08-01")).toBeInTheDocument();
    expect(screen.getByText("Prima azione")).toBeInTheDocument();
    expect(screen.getByText("2024-08-02")).toBeInTheDocument();
    expect(screen.getByText("Seconda azione")).toBeInTheDocument();
  });

  it("visualizza i dettagli della riga selezionata al click", () => {
  render(<HistoryTable rows={sampleRows} />);
  fireEvent.click(screen.getByText("2024-08-01")); // Click sulla prima riga
  expect(screen.getByText(/ID:/)).toBeInTheDocument();
  expect(screen.getByText("1")).toBeInTheDocument();
  const detail = screen.getByText(/Descrizione:/).parentElement;
  expect(detail).toHaveTextContent("Prima azione");
});


  it("chiama onSelect quando selezioni una riga", () => {
    const onSelect = jest.fn();
    render(<HistoryTable rows={sampleRows} onSelect={onSelect} />);
    fireEvent.click(screen.getByText("Seconda azione")); // Click sulla seconda riga
    expect(onSelect).toHaveBeenCalledWith(sampleRows[1]);
  });

  it("non esplode se rows è vuoto", () => {
    render(<HistoryTable rows={[]} />);
    expect(screen.queryByRole("row")).not.toBeNull(); // Ci sono almeno le intestazioni
  });

  it("non chiama onSelect se non passato", () => {
    render(<HistoryTable rows={sampleRows} />);
    fireEvent.click(screen.getByText("Prima azione")); // Nessun errore deve essere lanciato
    // Se non c'è expect, il test passa se non ci sono errori runtime
  });
});
