import { render, screen } from "@testing-library/react";
import { Azienda } from "../../../../models/azienda"
import AziendaDetails from "../AziendaDetails";

const sampleAzienda: Azienda = {
  id: "did:iota:evm:1234",
  name: "Azienda Test",
  seed: "SEED1234",
  legalInfo: {
    vat: "12345678901",
    lei: "LEI123456",
    address: "Via Roma, 1",
    email: "info@azienda.it",
    country: "Italia",
  },
  creators: ["did:iota:creator1"],
  operatori: ["did:iota:op1"],
  macchinari: ["did:iota:mac1"],
  createdAt: "2025-01-01T12:00:00Z",
};

describe("AziendaDetails", () => {
  test("renderizza correttamente tutti i dati", () => {
    render(<AziendaDetails azienda={sampleAzienda} />);
    
    // Etichette (nessun errore se ci sono duplicati)
    expect(screen.getAllByText(/ragione sociale:/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/did:/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/seed:/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/p\.iva:/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/lei:/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/indirizzo:/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/email:/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/nazione:/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/creatori:/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/operatori:/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/macchinari:/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/creato il:/i).length).toBeGreaterThan(0);

    // Valori univoci
    expect(screen.getByText(sampleAzienda.name)).toBeInTheDocument();
    expect(screen.getByText(sampleAzienda.id)).toBeInTheDocument();
    expect(screen.getByText(sampleAzienda.seed)).toBeInTheDocument();
    expect(screen.getByText(sampleAzienda.legalInfo!.vat!)).toBeInTheDocument();
    expect(screen.getByText(sampleAzienda.legalInfo!.lei!)).toBeInTheDocument();
    expect(screen.getByText(sampleAzienda.legalInfo!.address!)).toBeInTheDocument();
    expect(screen.getByText(sampleAzienda.legalInfo!.email!)).toBeInTheDocument();
    expect(screen.getByText(sampleAzienda.legalInfo!.country!)).toBeInTheDocument();

    // Numeri accanto alle etichette
    expect(screen.getByText(/creatori:/i).parentElement).toHaveTextContent("1");
    expect(screen.getByText(/operatori:/i).parentElement).toHaveTextContent("1");
    expect(screen.getByText(/macchinari:/i).parentElement).toHaveTextContent("1");

    // Data robusta (matcher che ritorna sempre boolean)
    if (sampleAzienda.createdAt) {
      const nodes = screen.getAllByText((_, node) =>
        Boolean(node && node.textContent && node.textContent.includes(sampleAzienda.createdAt!))
      );
      expect(nodes.length).toBeGreaterThan(0);
    }
  });
  test("matcha lo snapshot", () => {
    const { asFragment } = render(<AziendaDetails azienda={sampleAzienda} />);
    expect(asFragment()).toMatchSnapshot();
  });
});
