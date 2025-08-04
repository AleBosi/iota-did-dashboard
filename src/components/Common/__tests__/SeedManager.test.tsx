import { render, screen, fireEvent } from "@testing-library/react";
import SeedManager from "../SeedManager";

describe("SeedManager", () => {
  const seed = "SEED123456";
  const onReset = jest.fn();
  const onExport = jest.fn();
  const onImport = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("mostra il seed passato come prop", () => {
    render(<SeedManager seed={seed} />);
    expect(screen.getByText(seed)).toBeInTheDocument();
  });

  it("chiama onReset quando clicchi il bottone Reset", () => {
    render(<SeedManager seed={seed} onReset={onReset} />);
    fireEvent.click(screen.getByRole("button", { name: /reset/i }));
    expect(onReset).toHaveBeenCalled();
  });

  it("chiama onExport quando clicchi il bottone Esporta", () => {
    render(<SeedManager seed={seed} onExport={onExport} />);
    fireEvent.click(screen.getByRole("button", { name: /esporta/i }));
    expect(onExport).toHaveBeenCalled();
  });

  it("permette di scrivere nell'input di import", () => {
    render(<SeedManager seed={seed} />);
    const input = screen.getByPlaceholderText(/importa nuovo seed/i);
    fireEvent.change(input, { target: { value: "NEWSEED" } });
    expect(input).toHaveValue("NEWSEED");
  });

  it("chiama onImport col valore giusto quando clicchi Importa", () => {
    render(<SeedManager seed={seed} onImport={onImport} />);
    const input = screen.getByPlaceholderText(/importa nuovo seed/i);
    fireEvent.change(input, { target: { value: "NEWSEED" } });
    fireEvent.click(screen.getByRole("button", { name: /importa/i }));
    expect(onImport).toHaveBeenCalledWith("NEWSEED");
  });

  it("non lancia errore se onReset, onExport o onImport sono undefined", () => {
    render(<SeedManager seed={seed} />);
    // Nessun errore deve essere lanciato
    fireEvent.click(screen.getByRole("button", { name: /reset/i }));
    fireEvent.click(screen.getByRole("button", { name: /esporta/i }));
    const input = screen.getByPlaceholderText(/importa nuovo seed/i);
    fireEvent.change(input, { target: { value: "NEWSEED" } });
    fireEvent.click(screen.getByRole("button", { name: /importa/i }));
  });
});
