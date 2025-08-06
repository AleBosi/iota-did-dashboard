import { render, screen } from "@testing-library/react";
import VCVerifier from "../VCVerifier";

const mockVC = {
  subject: "did:iota:123",
  type: "Compliance",
  value: "Certificato OK",
  proof: {
    hash: "hash123",
    signature: "sig123"
  }
};

describe("VCVerifier component", () => {
  it("mostra ✅ Valida in verde quando verify ritorna true", () => {
    const verifyMock = jest.fn().mockReturnValue(true);
    render(<VCVerifier vc={mockVC} verify={verifyMock} />);
    expect(screen.getByText(/Valida/)).toHaveClass("text-green-600");
    expect(screen.getByText(/✅/)).toBeInTheDocument();
    expect(screen.queryByText(/Non valida/)).toBeNull();
    expect(verifyMock).toHaveBeenCalledWith(mockVC);
  });

  it("mostra ❌ Non valida in rosso quando verify ritorna false", () => {
    const verifyMock = jest.fn().mockReturnValue(false);
    render(<VCVerifier vc={mockVC} verify={verifyMock} />);
    expect(screen.getByText(/Non valida/)).toHaveClass("text-red-600");
    expect(screen.getByText(/❌/)).toBeInTheDocument();
    expect(screen.queryByText(/Valida/)).toBeNull();
    expect(verifyMock).toHaveBeenCalledWith(mockVC);
  });

  it("matcha lo snapshot", () => {
    const verifyMock = jest.fn().mockReturnValue(true);
    const { asFragment } = render(<VCVerifier vc={mockVC} verify={verifyMock} />);
    expect(asFragment()).toMatchSnapshot();
  });
});
