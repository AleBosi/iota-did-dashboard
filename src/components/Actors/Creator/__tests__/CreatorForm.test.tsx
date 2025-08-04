import { render, screen, fireEvent } from "@testing-library/react";
import CreatorForm from "../CreatorForm";

describe("CreatorForm", () => {
  const mockOnCreate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renderizza campo nome e bottone", () => {
    render(<CreatorForm onCreate={mockOnCreate} />);
    expect(screen.getByPlaceholderText(/nome creator/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /aggiungi/i })).toBeInTheDocument();
  });

  test("il bottone è disabilitato se il nome è vuoto o solo spazi", () => {
    render(<CreatorForm onCreate={mockOnCreate} />);
    const button = screen.getByRole("button", { name: /aggiungi/i });
    expect(button).toBeDisabled();
    fireEvent.change(screen.getByPlaceholderText(/nome creator/i), { target: { value: "  " } });
    expect(button).toBeDisabled();
  });

  test("il bottone si abilita se viene inserito un nome valido", () => {
    render(<CreatorForm onCreate={mockOnCreate} />);
    const button = screen.getByRole("button", { name: /aggiungi/i });
    fireEvent.change(screen.getByPlaceholderText(/nome creator/i), { target: { value: "Mario" } });
    expect(button).not.toBeDisabled();
  });

  test("chiama onCreate con il nome inserito e resetta il campo", () => {
    render(<CreatorForm onCreate={mockOnCreate} />);
    const input = screen.getByPlaceholderText(/nome creator/i);
    const button = screen.getByRole("button", { name: /aggiungi/i });

    fireEvent.change(input, { target: { value: "Mario" } });
    fireEvent.click(button);

    expect(mockOnCreate).toHaveBeenCalledTimes(1);
    expect(mockOnCreate).toHaveBeenCalledWith({ name: "Mario" });
    expect(input).toHaveValue("");
  });

  test("non chiama onCreate se si prova a inviare con campo vuoto", () => {
    render(<CreatorForm onCreate={mockOnCreate} />);
    fireEvent.click(screen.getByRole("button", { name: /aggiungi/i }));
    expect(mockOnCreate).not.toHaveBeenCalled();
  });

  // Snapshot base
  test("snapshot", () => {
    const { asFragment } = render(<CreatorForm onCreate={mockOnCreate} />);
    expect(asFragment()).toMatchSnapshot();
  });
});
