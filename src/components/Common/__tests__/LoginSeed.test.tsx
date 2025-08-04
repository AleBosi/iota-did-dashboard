import { render, screen, fireEvent } from "@testing-library/react";
import LoginSeed from "../LoginSeed";
import * as storageHelpers from "../../../utils/storageHelpers";
import { Actor } from "../../../models/actor";

describe("LoginSeed", () => {
  const aziendaId = "az1";
  const testSeed = "abc123";
  const fakeUser: Actor = {
    id: "u1",
    name: "Mario",
    role: "creator",
    aziendaId: aziendaId,
    seed: testSeed,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("mostra l'input e il bottone", () => {
    render(<LoginSeed onLogin={jest.fn()} aziendaId={aziendaId} />);
    expect(screen.getByPlaceholderText(/inserisci il seed/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
  });

  it("fa il login se trova il seed tra i creator", () => {
    jest.spyOn(storageHelpers, "loadItem").mockImplementation((key: string) => {
      if (key === `creators_${aziendaId}`) return [fakeUser];
      return [];
    });
    const onLogin = jest.fn();
    render(<LoginSeed onLogin={onLogin} aziendaId={aziendaId} />);
    fireEvent.change(screen.getByPlaceholderText(/inserisci il seed/i), { target: { value: testSeed } });
    fireEvent.click(screen.getByRole("button", { name: /login/i }));
    expect(onLogin).toHaveBeenCalledWith(fakeUser);
    expect(screen.queryByText(/seed non trovato/i)).not.toBeInTheDocument();
  });

  it("fa il login se trova il seed tra operatori o macchinari", () => {
    const fakeOp: Actor = {
      ...fakeUser,
      role: "operatore",
    };
    jest.spyOn(storageHelpers, "loadItem").mockImplementation((key: string) => {
      if (key === `creators_${aziendaId}`) return [];
      if (key === `operatori_${aziendaId}`) return [fakeOp];
      if (key === `macchinari_${aziendaId}`) return [];
      return [];
    });
    const onLogin = jest.fn();
    render(<LoginSeed onLogin={onLogin} aziendaId={aziendaId} />);
    fireEvent.change(screen.getByPlaceholderText(/inserisci il seed/i), { target: { value: testSeed } });
    fireEvent.click(screen.getByRole("button", { name: /login/i }));
    expect(onLogin).toHaveBeenCalledWith(fakeOp);
  });

  it("mostra errore se seed non trovato in nessuna lista", () => {
    jest.spyOn(storageHelpers, "loadItem").mockReturnValue([]);
    const onLogin = jest.fn();
    render(<LoginSeed onLogin={onLogin} aziendaId={aziendaId} />);
    fireEvent.change(screen.getByPlaceholderText(/inserisci il seed/i), { target: { value: "notfound" } });
    fireEvent.click(screen.getByRole("button", { name: /login/i }));
    expect(onLogin).not.toHaveBeenCalled();
    expect(screen.getByText(/seed non trovato/i)).toBeInTheDocument();
  });

  it("resetta l'errore dopo login riuscito", () => {
    // Prima login fallito, poi login riuscito
    jest.spyOn(storageHelpers, "loadItem").mockImplementation((key: string) => {
      if (key === `creators_${aziendaId}`) return [];
      return [];
    });
    const onLogin = jest.fn();
    render(<LoginSeed onLogin={onLogin} aziendaId={aziendaId} />);
    fireEvent.change(screen.getByPlaceholderText(/inserisci il seed/i), { target: { value: "fail" } });
    fireEvent.click(screen.getByRole("button", { name: /login/i }));
    expect(screen.getByText(/seed non trovato/i)).toBeInTheDocument();

    // Mock ora restituisce utente valido
    (storageHelpers.loadItem as jest.Mock).mockImplementation((key: string) => {
      if (key === `creators_${aziendaId}`) return [fakeUser];
      return [];
    });
    fireEvent.change(screen.getByPlaceholderText(/inserisci il seed/i), { target: { value: testSeed } });
    fireEvent.click(screen.getByRole("button", { name: /login/i }));
    expect(screen.queryByText(/seed non trovato/i)).not.toBeInTheDocument();
    expect(onLogin).toHaveBeenCalledWith(fakeUser);
  });
});
