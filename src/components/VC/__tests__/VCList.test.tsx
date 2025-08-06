import { render, screen, fireEvent } from "@testing-library/react";
import VCList from "../VCList";

// Mock completo VerifiableCredential (con status, value nel credentialSubject)
const mockVCs = [
  {
    '@context': ["https://www.w3.org/2018/credentials/v1"],
    id: "1",
    type: ["VerifiableCredential", "Compliance"],
    issuer: "did:iota:issuer1",
    issuanceDate: "2025-08-01",
    credentialSubject: {
      id: "did:iota:prod1",
      value: "ok",
      status: "valid"
    },
    proof: {
      type: "Ed25519Signature2020",
      created: "2025-08-01T00:00:00Z",
      proofPurpose: "assertionMethod",
      verificationMethod: "did:iota:issuer1#keys-1",
      jws: "mock",
      hash: "mock-hash-1"
    }
  },
  {
    '@context': ["https://www.w3.org/2018/credentials/v1"],
    id: "2",
    type: ["VerifiableCredential", "Quality"],
    issuer: "did:iota:issuer2",
    issuanceDate: "2025-08-02",
    credentialSubject: {
      id: "did:iota:prod2",
      value: "not ok",
      status: "revoked"
    },
    proof: {
      type: "Ed25519Signature2020",
      created: "2025-08-02T00:00:00Z",
      proofPurpose: "assertionMethod",
      verificationMethod: "did:iota:issuer2#keys-1",
      jws: "mock",
      hash: "mock-hash-2"
    }
  }
];

// Mock del componente VCViewer per isolare il test
jest.mock("../VCViewer", () => ({
  __esModule: true,
  default: ({ vc }: any) => <div data-testid="vcviewer">{vc?.subject}</div>
}));

describe("VCList component", () => {
  it("renderizza tutte le VC ricevute", () => {
    render(<VCList vcs={mockVCs} />);
    expect(screen.getByText("Compliance")).toBeInTheDocument();
    expect(screen.getByText("Quality")).toBeInTheDocument();
    expect(screen.getByText("did:iota:issuer1")).toBeInTheDocument();
    expect(screen.getByText("did:iota:issuer2")).toBeInTheDocument();
    expect(screen.getByText("2025-08-01")).toBeInTheDocument();
    expect(screen.getByText("2025-08-02")).toBeInTheDocument();
  });

  it("status ha classe corretta: verde per valid, rossa per revoked", () => {
    render(<VCList vcs={mockVCs} />);
    const statusValid = screen.getByText("valid");
    const statusRevoked = screen.getByText("revoked");
    expect(statusValid).toHaveClass("text-green-600");
    expect(statusRevoked).toHaveClass("text-red-600");
  });

  it("se clicco una VC, mostra il dettaglio in VCViewer", () => {
    render(<VCList vcs={mockVCs} />);
    fireEvent.click(screen.getByText("Compliance"));
    expect(screen.getByTestId("vcviewer")).toHaveTextContent("did:iota:prod1");
    fireEvent.click(screen.getByText("Quality"));
    expect(screen.getByTestId("vcviewer")).toHaveTextContent("did:iota:prod2");
  });

  it("chiama onSelect quando una VC viene cliccata", () => {
    const onSelect = jest.fn();
    render(<VCList vcs={mockVCs} onSelect={onSelect} />);
    fireEvent.click(screen.getByText("Compliance"));
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: "1" }));
    fireEvent.click(screen.getByText("Quality"));
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: "2" }));
  });

  it("non esplode se la lista è vuota", () => {
    render(<VCList vcs={[]} />);
    expect(screen.queryByText("Compliance")).toBeNull();
    expect(screen.queryByText("Quality")).toBeNull();
  });

  it("matcha lo snapshot", () => {
    const { asFragment } = render(<VCList vcs={mockVCs} />);
    expect(asFragment()).toMatchSnapshot();
  });
});
