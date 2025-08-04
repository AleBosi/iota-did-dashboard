import { render, screen, fireEvent } from "@testing-library/react";
import Sidebar from "../Sidebar";

describe("Sidebar", () => {
  it("mostra il titolo dell'app", () => {
    render(<Sidebar role="admin" />);
    expect(screen.getByText(/DPP IOTA/i)).toBeInTheDocument();
  });

  it("renderizza i tab corretti per il ruolo admin", () => {
    render(<Sidebar role="admin" />);
    expect(screen.getByText("Aziende")).toBeInTheDocument();
    expect(screen.getByText("Crediti sistema")).toBeInTheDocument();
    expect(screen.getByText("Import/Export")).toBeInTheDocument();
  });

  it("renderizza i tab corretti per il ruolo azienda", () => {
    render(<Sidebar role="azienda" />);
    expect(screen.getByText("Dati azienda")).toBeInTheDocument();
    expect(screen.getByText("Utenti")).toBeInTheDocument();
    expect(screen.getByText("Prodotti")).toBeInTheDocument();
    expect(screen.getByText("Tipi prodotto")).toBeInTheDocument();
    expect(screen.getByText("Eventi")).toBeInTheDocument();
    expect(screen.getByText("VC")).toBeInTheDocument();
    expect(screen.getByText("Crediti")).toBeInTheDocument();
    expect(screen.getByText("Import/Export")).toBeInTheDocument();
    expect(screen.getByText("Gestione seed")).toBeInTheDocument();
  });

  it("renderizza i tab corretti per il ruolo creator", () => {
    render(<Sidebar role="creator" />);
    ["Utenti", "Prodotti", "Eventi", "VC"].forEach(label =>
      expect(screen.getByText(label)).toBeInTheDocument()
    );
  });

  it("renderizza i tab corretti per il ruolo operatore", () => {
    render(<Sidebar role="operatore" />);
    ["Prodotti", "Eventi", "VC", "Crediti"].forEach(label =>
      expect(screen.getByText(label)).toBeInTheDocument()
    );
  });

  it("renderizza i tab corretti per il ruolo macchinario", () => {
    render(<Sidebar role="macchinario" />);
    ["Eventi", "VC", "Crediti"].forEach(label =>
      expect(screen.getByText(label)).toBeInTheDocument()
    );
  });

  it("evidenzia il tab selezionato", () => {
    render(<Sidebar role="azienda" selectedTab="products" />);
    const btn = screen.getByRole("button", { name: "Prodotti" });
    expect(btn).toHaveClass("bg-blue-100");
    expect(btn).toHaveClass("text-blue-700");
    expect(btn).toHaveClass("font-bold");
  });

  it("chiama onTabSelect con il valore corretto", () => {
    const onTabSelect = jest.fn();
    render(<Sidebar role="azienda" onTabSelect={onTabSelect} />);
    fireEvent.click(screen.getByRole("button", { name: "VC" }));
    expect(onTabSelect).toHaveBeenCalledWith("vc");
  });

  it("non va in errore se onTabSelect non è passato", () => {
    render(<Sidebar role="azienda" />);
    // Prova click su un tab: non deve lanciare errori
    fireEvent.click(screen.getByRole("button", { name: "Crediti" }));
  });
});
