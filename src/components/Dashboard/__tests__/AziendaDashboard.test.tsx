import { render, fireEvent, screen } from "@testing-library/react";
import AziendaDashboard from "../AziendaDashboard";
import { Azienda } from "../../../models/azienda";
import { UserContext } from "../../../contexts/UserContext";

// Mock azienda base
const mockAzienda: Azienda = {
  id: "az1",
  name: "Azienda Test",
  seed: "SEEDAZ1",
  credits: 1000,
};

describe("AziendaDashboard", () => {
  it("renderizza la dashboard con tab info", () => {
    render(
      <UserContext.Provider value={{ logout: jest.fn(), user: { ...mockAzienda, role: "azienda" } }}>
        <AziendaDashboard azienda={mockAzienda} />
      </UserContext.Provider>
    );
    expect(screen.getByText(/Dashboard Azienda/i)).toBeInTheDocument();
    expect(screen.getByText(/Dettagli Azienda/i)).toBeInTheDocument();
  });

  it("consente di passare ai tab users e creare operatori", () => {
    render(
      <UserContext.Provider value={{ logout: jest.fn(), user: { ...mockAzienda, role: "azienda" } }}>
        <AziendaDashboard azienda={mockAzienda} />
      </UserContext.Provider>
    );
    fireEvent.click(screen.getByText(/Operatori/i)); // Passa al tab operatori
    expect(screen.getByText(/Operatore/i)).toBeInTheDocument();
    // Simula aggiunta operatore (in base a come è strutturato OperatoreForm)
    // fireEvent.change(...), fireEvent.click(...), verifica che appaia nella lista
  });

  it("gestisce la distribuzione crediti solo a operatori/macchinari", () => {
    render(
      <UserContext.Provider value={{ logout: jest.fn(), user: { ...mockAzienda, role: "azienda" } }}>
        <AziendaDashboard azienda={mockAzienda} />
      </UserContext.Provider>
    );
    fireEvent.click(screen.getByText(/Crediti/i));
    expect(screen.getByText(/Crediti disponibili/i)).toBeInTheDocument();
    // Popola select, input, simula assegnazione e verifica stato/alert
  });

  // Altri test: import/export, VC, eventi, seed, ecc
});
