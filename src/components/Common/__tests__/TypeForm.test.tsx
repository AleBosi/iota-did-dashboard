import { render, screen, fireEvent } from "@testing-library/react";
import TypeForm from "../TypeForm";

describe("TypeForm", () => {
  const type = { id: "t1", name: "Materiale", fields: [], eventFields: [] };
  const onSave = jest.fn();
  const onCancel = jest.fn();

  beforeEach(() => {
    onSave.mockClear();
    onCancel.mockClear();
  });

  it("renderizza titolo Nuova tipologia se type non ha id", () => {
    render(<TypeForm type={{ id: "", name: "" }} onSave={onSave} onCancel={onCancel} />);
    expect(screen.getByText(/nuova tipologia/i)).toBeInTheDocument();
  });

  it("renderizza titolo Modifica tipologia se type ha id", () => {
    render(<TypeForm type={type} onSave={onSave} onCancel={onCancel} />);
    expect(screen.getByText(/modifica tipologia/i)).toBeInTheDocument();
  });

  it("renderizza l'input precompilato se name presente", () => {
    render(<TypeForm type={type} onSave={onSave} onCancel={onCancel} />);
    expect(screen.getByDisplayValue(type.name)).toBeInTheDocument();
  });

  it("chiama onSave con il nuovo nome", () => {
    render(<TypeForm type={type} onSave={onSave} onCancel={onCancel} />);
    fireEvent.change(screen.getByPlaceholderText(/nome tipologia/i), { target: { value: "Nuovo Nome" } });
    fireEvent.click(screen.getByRole("button", { name: /salva/i }));
    expect(onSave).toHaveBeenCalledWith({ ...type, name: "Nuovo Nome" });
  });

  it("mostra alert se nome vuoto e non chiama onSave", () => {
    window.alert = jest.fn();
    render(<TypeForm type={type} onSave={onSave} onCancel={onCancel} />);
    fireEvent.change(screen.getByPlaceholderText(/nome tipologia/i), { target: { value: "" } });
    fireEvent.click(screen.getByRole("button", { name: /salva/i }));
    expect(window.alert).toHaveBeenCalledWith("Nome obbligatorio");
    expect(onSave).not.toHaveBeenCalled();
  });

  it("chiama onCancel quando clicchi Annulla", () => {
    render(<TypeForm type={type} onSave={onSave} onCancel={onCancel} />);
    fireEvent.click(screen.getByRole("button", { name: /annulla/i }));
    expect(onCancel).toHaveBeenCalled();
  });
});
