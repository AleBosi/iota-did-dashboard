import { render, screen } from "@testing-library/react";
import ProductDetails from "../ProductDetails";
import { Product } from "../../../models/product";

const product: Product = {
  productId: "prod-1",
  typeId: "smartphone",
  did: "did:prod:1",
  serial: "ABC123",
  owner: "did:azienda:1",
  credentials: ["vc1", "vc2"],
  children: [
    {
      productId: "prod-2",
      typeId: "batteria",
      did: "did:prod:2",
      credentials: ["vc-bat"],
      children: [],
    },
    {
      productId: "prod-3",
      typeId: "scheda-madre",
      did: "did:prod:3",
      credentials: [],
      children: [],
    },
  ],
};

describe("ProductDetails", () => {
  it("mostra tutti i dettagli del prodotto", () => {
    render(<ProductDetails product={product} />);
    expect(screen.getByText("Dettagli Prodotto")).toBeInTheDocument();
    expect(screen.getByText("smartphone")).toBeInTheDocument();
    expect(screen.getByText("prod-1")).toBeInTheDocument();
    expect(screen.getByText("did:prod:1")).toBeInTheDocument();
    expect(screen.getByText("ABC123")).toBeInTheDocument();
    expect(screen.getByText("did:azienda:1")).toBeInTheDocument();
    // Badge VC
    const vcDiv = screen.getByText(/VC associate:/).parentElement;
    expect(vcDiv).not.toBeNull();
    expect(vcDiv?.querySelector("span")).toHaveTextContent("2");
    // BOM: figli devono comparire
    expect(screen.getByText("batteria")).toBeInTheDocument();
    expect(screen.getByText("scheda-madre")).toBeInTheDocument();
  });

  it("mostra messaggio se nessun prodotto selezionato", () => {
    render(<ProductDetails product={null as any} />);
    expect(screen.getByText(/nessun prodotto/i)).toBeInTheDocument();
  });
});
