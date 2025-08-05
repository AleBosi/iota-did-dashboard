import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AziendaForm from "../AziendaForm";

describe("AziendaForm", () => {
  const mockOnCreate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renderizza tutti i campi richiesti", () => {
    render(<AziendaForm onCreate={mockOnCreate} />);
    expect(screen.getByPlaceholderText(/ragione sociale/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/partita iva/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/lei/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/indirizzo/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/nazione/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /crea azienda/i })).toBeInTheDocument();
  });

  test("non chiama onCreate se il campo Ragione sociale è vuoto", async () => {
    render(<AziendaForm onCreate={mockOnCreate} />);
    fireEvent.click(screen.getByRole("button", { name: /crea azienda/i }));
    await waitFor(() => {
      expect(mockOnCreate).not.toHaveBeenCalled();
    });
  });

  test("chiama onCreate con i dati inseriti", async () => {
    render(<AziendaForm onCreate={mockOnCreate} />);
    fireEvent.change(screen.getByPlaceholderText(/ragione sociale/i), { target: { value: "Azienda Test" } });
    fireEvent.change(screen.getByPlaceholderText(/partita iva/i), { target: { value: "12345678901" } });
    fireEvent.change(screen.getByPlaceholderText(/lei/i), { target: { value: "LEI123456" } });
    fireEvent.change(screen.getByPlaceholderText(/indirizzo/i), { target: { value: "Via Roma, 1" } });
    fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: "info@test.it" } });
    fireEvent.change(screen.getByPlaceholderText(/nazione/i), { target: { value: "Italia" } });

    fireEvent.click(screen.getByRole("button", { name: /crea azienda/i }));

    await waitFor(() => {
      expect(mockOnCreate).toHaveBeenCalledTimes(1);
      const azienda = mockOnCreate.mock.calls[0][0];
      expect(azienda.name).toBe("Azienda Test");
      expect(azienda.legalInfo.vat).toBe("12345678901");
      expect(azienda.legalInfo.lei).toBe("LEI123456");
      expect(azienda.legalInfo.address).toBe("Via Roma, 1");
      expect(azienda.legalInfo.email).toBe("info@test.it");
      expect(azienda.legalInfo.country).toBe("Italia");
      expect(azienda.id).toMatch(/^did:iota:evm:/);
      expect(azienda.did).toMatch(/^did:iota:evm:/);
      expect(azienda.seed).toMatch(/^SEED_/);
      expect(Array.isArray(azienda.creators)).toBe(true);
      expect(Array.isArray(azienda.vcIds)).toBe(true);
          });
  });

  test("svuota i campi dopo il submit", async () => {
    render(<AziendaForm onCreate={mockOnCreate} />);
    fireEvent.change(screen.getByPlaceholderText(/ragione sociale/i), { target: { value: "Azienda Test" } });
    fireEvent.click(screen.getByRole("button", { name: /crea azienda/i }));

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/ragione sociale/i)).toHaveValue("");
    });
  });

  // Snapshot di base
  test("matcha lo snapshot", () => {
    const { asFragment } = render(<AziendaForm onCreate={mockOnCreate} />);
    expect(asFragment()).toMatchSnapshot();
  });
});
