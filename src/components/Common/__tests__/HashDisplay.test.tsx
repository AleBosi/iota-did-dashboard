import { render, screen } from "@testing-library/react";
import HashDisplay from "../HashDisplay";

describe("HashDisplay", () => {
  const hash = "abc123def456";
  const label = "Hash SHA256:";

  it("mostra il valore hash", () => {
    render(<HashDisplay value={hash} />);
    expect(screen.getByText(hash)).toBeInTheDocument();
  });

  it("mostra il label se passato", () => {
    render(<HashDisplay value={hash} label={label} />);
    expect(screen.getByText(label)).toBeInTheDocument();
    expect(screen.getByText(hash)).toBeInTheDocument();
  });

  it("non mostra label se non passato", () => {
    render(<HashDisplay value={hash} />);
    // Il label non deve esserci
    expect(screen.queryByText(label)).not.toBeInTheDocument();
  });

  it("usa classi di stile corrette", () => {
    render(<HashDisplay value={hash} label={label} />);
    expect(screen.getByText(hash)).toHaveClass("font-mono");
    expect(screen.getByText(hash)).toHaveClass("text-xs");
  });
});
