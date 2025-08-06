import { render, screen, fireEvent } from "@testing-library/react";
import VCCreator from "../VCCreator";

describe("VCCreator component", () => {
  it("renderizza i campi e il bottone", () => {
    render(<VCCreator onCreate={jest.fn()} />);
    expect(screen.getByPlaceholderText(/Subject/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Tipo credential/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Valore\/Attributo/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /crea vc/i })).toBeInTheDocument();
  });

  it("il bottone è disabilitato se i campi sono vuoti", () => {
    render(<VCCreator onCreate={jest.fn()} />);
    const btn = screen.getByRole("button", { name: /crea vc/i });
    expect(btn).toBeDisabled();
  });

  it("il bottone è abilitato solo se tutti i campi sono compilati", () => {
    render(<VCCreator onCreate={jest.fn()} />);
    fireEvent.change(screen.getByPlaceholderText(/Subject/i), { target: { value: "did:iota:123" } });
    fireEvent.change(screen.getByPlaceholderText(/Tipo credential/i), { target: { value: "Compliance" } });
    fireEvent.change(screen.getByPlaceholderText(/Valore\/Attributo/i), { target: { value: "Certificato OK" } });
    const btn = screen.getByRole("button", { name: /crea vc/i });
    expect(btn).not.toBeDisabled();
  });

  it("chiama onCreate con i valori corretti e resetta i campi", () => {
    const onCreate = jest.fn();
    render(<VCCreator onCreate={onCreate} />);
    fireEvent.change(screen.getByPlaceholderText(/Subject/i), { target: { value: "did:iota:123" } });
    fireEvent.change(screen.getByPlaceholderText(/Tipo credential/i), { target: { value: "Compliance" } });
    fireEvent.change(screen.getByPlaceholderText(/Valore\/Attributo/i), { target: { value: "Certificato OK" } });
    fireEvent.click(screen.getByRole("button", { name: /crea vc/i }));

    expect(onCreate).toHaveBeenCalledWith({
      subject: "did:iota:123",
      type: "Compliance",
      value: "Certificato OK"
    });

    // I campi sono svuotati
    expect(screen.getByPlaceholderText(/Subject/i)).toHaveValue("");
    expect(screen.getByPlaceholderText(/Tipo credential/i)).toHaveValue("");
    expect(screen.getByPlaceholderText(/Valore\/Attributo/i)).toHaveValue("");
  });

  it("NON chiama onCreate se almeno un campo è vuoto", () => {
    const onCreate = jest.fn();
    render(<VCCreator onCreate={onCreate} />);
    // Subject e tipo, ma non valore
    fireEvent.change(screen.getByPlaceholderText(/Subject/i), { target: { value: "did:iota:123" } });
    fireEvent.change(screen.getByPlaceholderText(/Tipo credential/i), { target: { value: "Compliance" } });
    fireEvent.click(screen.getByRole("button", { name: /crea vc/i }));
    expect(onCreate).not.toHaveBeenCalled();
  });

  it("matcha lo snapshot", () => {
    const { asFragment } = render(<VCCreator onCreate={jest.fn()} />);
    expect(asFragment()).toMatchSnapshot();
  });
});
