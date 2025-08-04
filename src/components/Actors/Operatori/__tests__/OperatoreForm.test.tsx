import { render, screen, fireEvent } from "@testing-library/react";
import OperatoreForm from "../OperatoreForm";

describe("OperatoreForm", () => {
  const mockOnCreate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renderizza campo nome e bottone", () => {
    render(<OperatoreForm onCreate={mockOnCreate} />);
    expect(screen.getByPlaceholderText(/nome operatore/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /aggiungi/i })).toBeInTheDocument();
  });

  test("il bottone è disabilitato se il nome è vuoto o solo spazi", () => {
    render(<OperatoreForm onCreate={mockOnCreate} />);
    const button = screen.getByRole("button", { name: /aggiungi/i });
    expect(button).toBeDisabled();
    fireEvent.change(screen.getByPlaceholderText(/nome operatore/i), { target: { value: "  " } });
    expect(button).toBeDisabled();
  });

  test("il bottone si abilita se viene inserito un nome valido", () => {
    render(<OperatoreForm onCreate={mockOnCreate} />);
    const button = screen.getByRole("button", { name: /aggiungi/i });
    fireEvent.change(screen.getByPlaceholderText(/nome operatore/i), { target: { value: "Anna" } });
    expect(button).not.toBeDisabled();
  });

  test("chiama onCreate con il nome inserito e resetta il campo", () => {
    render(<OperatoreForm onCreate={mockOnCreate} />);
    const input = screen.getByPlaceholderText(/nome operatore/i);
    const button = screen.getByRole("button", { name: /aggiungi/i });

    fireEvent.change(input, { target: { value: "Anna" } });
    fireEvent.click(button);

    expect(mockOnCreate).toHaveBeenCalledTimes(1);
    expect(mockOnCreate).toHaveBeenCalledWith({ name: "Anna" });
    expect(input).toHaveValue("");
  });

  test("non chiama onCreate se si prova a inviare con campo vuoto", () => {
    render(<OperatoreForm onCreate={mockOnCreate} />);
    fireEvent.click(screen.getByRole("button", { name: /aggiungi/i }));
    expect(mockOnCreate).not.toHaveBeenCalled();
  });

  // Snapshot base
  test("snapshot", () => {
    const { asFragment } = render(<OperatoreForm onCreate={mockOnCreate} />);
    expect(asFragment()).toMatchSnapshot();
  });
});
