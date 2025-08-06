import { render, screen } from "@testing-library/react";
import VCViewer from "../VCViewer";

const baseVc = {
  subject: "did:iota:123",
  type: "Compliance",
  value: "Certificato OK"
};

describe("VCViewer component", () => {
  it("visualizza subject, type e value", () => {
    render(<VCViewer vc={baseVc} />);
    expect(screen.getByText(baseVc.subject)).toBeInTheDocument();
    expect(screen.getByText(baseVc.type)).toBeInTheDocument();
    expect(screen.getByText(baseVc.value)).toBeInTheDocument();
  });

  it("visualizza issuer se presente", () => {
    render(<VCViewer vc={{ ...baseVc, issuer: "did:iota:issuer" }} />);
    expect(screen.getByText("did:iota:issuer")).toBeInTheDocument();
  });

  it("NON visualizza issuer se non presente", () => {
    render(<VCViewer vc={baseVc} />);
    expect(screen.queryByText(/did:iota:issuer/i)).toBeNull();
  });

  it("visualizza issuedAt se presente", () => {
    render(<VCViewer vc={{ ...baseVc, issuedAt: "2025-08-05" }} />);
    expect(screen.getByText("2025-08-05")).toBeInTheDocument();
  });

  it("NON visualizza issuedAt se non presente", () => {
    render(<VCViewer vc={baseVc} />);
    expect(screen.queryByText(/2025-08-05/i)).toBeNull();
  });

  it("matcha lo snapshot", () => {
    const { asFragment } = render(
      <VCViewer vc={{ ...baseVc, issuer: "did:iota:issuer", issuedAt: "2025-08-05" }} />
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
