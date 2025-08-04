import { render, screen, fireEvent } from "@testing-library/react";
import MacchinarioForm from "../MacchinarioForm";

describe("MacchinarioForm", () => {
  const mockOnCreate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renderizza campo nome e bottone", () => {
    render(<MacchinarioForm onCreate={mockOnCreate} />);
    expect(screen.getByPlaceholderText(/nome macchinario/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /aggiungi/i })).toBeInTheDocument();
  });

  test("il bottone è disabilitato se il nome è vuoto o solo spazi", () => {
    render(<MacchinarioForm onCreate={mockOnCreate} />);
    const button = screen.getByRole("button", { name: /aggiungi/i });
    expect(button).toBeDisabled();
    fireEvent.change(screen.getByPlaceholderText(/nome macchinario/i), { target: { value: "  " } });
    expect(button).toBeDisabled();
  });

  test("il bottone si abilita se viene inserito un nome valido", () => {
    render(<MacchinarioForm onCreate={mockOnCreate} />);
    const button = screen.getByRole("button", { name: /aggiungi/i });
    fireEvent.change(screen.getByPlaceholderText(/nome macchinario/i), { target: { value: "Robot Saldatura" } });
    expect(button).not.toBeDisabled();
  });

  test("chiama onCreate con il nome inserito e resetta il campo", () => {
    render(<MacchinarioForm onCreate={mockOnCreate} />);
    const input = screen.getByPlaceholderText(/nome macchinario/i);
    const button = screen.getByRole("button", { name: /aggiungi/i });

    fireEvent.change(input, { target: { value: "Robot Saldatura" } });
    fireEvent.click(button);

    expect(mockOnCreate).toHaveBeenCalledTimes(1);
    expect(mockOnCreate).toHaveBeenCalledWith({ name: "Robot Saldatura" });
    expect(input).toHaveValue("");
  });

  test("non chiama onCreate se si prova a inviare con campo vuoto", () => {
    render(<MacchinarioForm onCreate={mockOnCreate} />);
    fireEvent.click(screen.getByRole("button", { name: /aggiungi/i }));
    expect(mockOnCreate).not.toHaveBeenCalled();
  });

  // Snapshot base
  test("snapshot", () => {
    const { asFragment } = render(<MacchinarioForm onCreate={mockOnCreate} />);
    expect(asFragment()).toMatchSnapshot();
  });
});