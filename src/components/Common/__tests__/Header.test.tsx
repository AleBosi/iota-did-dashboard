import { render, screen, fireEvent } from "@testing-library/react";
import Header from "../Header";

const user = {
  username: "Mario Rossi",
  role: "admin",
  avatarUrl: "https://i.pravatar.cc/100?img=1"
} as const;

describe("Header", () => {
  it("renderizza username e ruolo in italiano", () => {
    render(<Header user={user} />);
    expect(screen.getByText(user.username)).toBeInTheDocument();
    expect(screen.getByText("Amministratore")).toBeInTheDocument();
  });

  it("mostra l'avatar se presente", () => {
    render(<Header user={user} />);
    const img = screen.getByAltText(user.username) as HTMLImageElement;
    expect(img).toBeInTheDocument();
    expect(img.src).toContain(user.avatarUrl);
  });

  it("NON mostra l'avatar se avatarUrl non c'è", () => {
    const userNoAvatar = { ...user, avatarUrl: undefined };
    render(<Header user={userNoAvatar} />);
    expect(screen.queryByAltText(user.username)).not.toBeInTheDocument();
  });

  it("mostra il bottone logout se onLogout è passato", () => {
    render(<Header user={user} onLogout={jest.fn()} />);
    expect(screen.getByRole("button", { name: /logout/i })).toBeInTheDocument();
  });

  it("NON mostra il bottone logout se onLogout non è passato", () => {
    render(<Header user={user} />);
    expect(screen.queryByRole("button", { name: /logout/i })).not.toBeInTheDocument();
  });

  it("chiama onLogout quando clicchi logout", () => {
    const onLogout = jest.fn();
    render(<Header user={user} onLogout={onLogout} />);
    fireEvent.click(screen.getByRole("button", { name: /logout/i }));
    expect(onLogout).toHaveBeenCalled();
  });

  it("renderizza correttamente i vari ruoli", () => {
    const roles = [
      { role: "admin", label: "Amministratore" },
      { role: "azienda", label: "Azienda" },
      { role: "creator", label: "Creator" },
      { role: "operatore", label: "Operatore" },
      { role: "macchinario", label: "Macchinario" }
    ] as const;
    for (const { role, label } of roles) {
      render(<Header user={{ ...user, role, avatarUrl: undefined }} />);
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });
});
