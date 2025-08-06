import { render, screen, fireEvent } from "@testing-library/react";
import CreditsDashboard from "../CreditsDashboard";

describe("CreditsDashboard", () => {
  const members = [
    { id: "op-1", name: "Mario Rossi" },
    { id: "mac-1", name: "Macchinario 1" },
  ];

  it("mostra il saldo crediti", () => {
    render(<CreditsDashboard credits={100} role="azienda" members={members} />);
    expect(screen.getByText(/Crediti disponibili/i)).toBeInTheDocument();
    expect(screen.getByText("100")).toBeInTheDocument();
  });

  it("admin può selezionare destinatario e assegnare crediti", () => {
    const onAssignCredits = jest.fn();
    render(
      <CreditsDashboard
        credits={200}
        role="admin"
        members={members}
        onAssignCredits={onAssignCredits}
      />
    );
    // Seleziona destinatario
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "op-1" } });
    // Inserisci quantità
    fireEvent.change(screen.getByPlaceholderText("Crediti"), { target: { value: "10" } });
    // Clicca "Assegna"
    fireEvent.click(screen.getByText(/Assegna/i));
    expect(onAssignCredits).toHaveBeenCalledWith("op-1", 10);
  });

  it("azienda può assegnare crediti a un operatore/macchinario", () => {
    const onAssignCredits = jest.fn();
    render(
      <CreditsDashboard
        credits={50}
        role="azienda"
        members={members}
        onAssignCredits={onAssignCredits}
      />
    );
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "mac-1" } });
    fireEvent.change(screen.getByPlaceholderText("Crediti"), { target: { value: "5" } });
    fireEvent.click(screen.getByText(/Assegna/i));
    expect(onAssignCredits).toHaveBeenCalledWith("mac-1", 5);
  });

  it("operatore vede solo il saldo e nessuna funzione di assegnazione", () => {
    render(<CreditsDashboard credits={15} role="operatore" />);
    expect(screen.getByText(/Solo visualizzazione saldo/i)).toBeInTheDocument();
    expect(screen.queryByText(/Assegna/i)).toBeNull();
    expect(screen.queryByRole("combobox")).toBeNull();
  });

  it("disabilita il bottone se quantità non valida o nessun destinatario", () => {
    render(
      <CreditsDashboard credits={10} role="azienda" members={members} />
    );
    // Bottone disabilitato se qty = 0
    expect(screen.getByText(/Assegna/i)).toBeDisabled();
    // Bottone disabilitato se nessun destinatario
    fireEvent.change(screen.getByPlaceholderText("Crediti"), { target: { value: "3" } });
    expect(screen.getByText(/Assegna/i)).toBeDisabled();
  });
});
