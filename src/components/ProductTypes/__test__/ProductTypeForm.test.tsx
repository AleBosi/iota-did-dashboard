import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ProductTypeForm from "../ProductTypeForm";

describe("ProductTypeForm", () => {
  const mockOnCreate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renderizza campi nome e descrizione e bottone", () => {
    render(<ProductTypeForm onCreate={mockOnCreate} />);
    expect(screen.getByPlaceholderText(/nome tipologia/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/descrizione/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /crea tipologia/i })).toBeInTheDocument();
  });

  test("non submit se nome tipologia è vuoto", async () => {
    render(<ProductTypeForm onCreate={mockOnCreate} />);
    fireEvent.click(screen.getByRole("button", { name: /crea tipologia/i }));
    await waitFor(() => {
      expect(mockOnCreate).not.toHaveBeenCalled();
    });
  });

  test("submit chiama onCreate con i dati corretti e resetta i campi", async () => {
    render(<ProductTypeForm onCreate={mockOnCreate} />);
    fireEvent.change(screen.getByPlaceholderText(/nome tipologia/i), { target: { value: "Tipologia Test" } });
    fireEvent.change(screen.getByPlaceholderText(/descrizione/i), { target: { value: "Descrizione test" } });

    fireEvent.click(screen.getByRole("button", { name: /crea tipologia/i }));

    await waitFor(() => {
      expect(mockOnCreate).toHaveBeenCalledTimes(1);
      const arg = mockOnCreate.mock.calls[0][0];
      expect(arg.name).toBe("Tipologia Test");
      expect(arg.description).toBe("Descrizione test");
      expect(arg.id).toBeDefined();
      expect(typeof arg.id).toBe("string");
    });

    expect(screen.getByPlaceholderText(/nome tipologia/i)).toHaveValue("");
    expect(screen.getByPlaceholderText(/descrizione/i)).toHaveValue("");
  });

  // Snapshot
  test("matcha lo snapshot", () => {
    const { asFragment } = render(<ProductTypeForm onCreate={mockOnCreate} />);
    expect(asFragment()).toMatchSnapshot();
  });
});
