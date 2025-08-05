import { render, screen, fireEvent, within } from "@testing-library/react";
import ProductList from "../ProductList";
import { Product } from "../../../models/product";

const products: Product[] = [
  {
    productId: "prod-1",
    typeId: "smartphone",
    did: "did:prod:1",
    serial: "ABC123",
    credentials: ["vc1", "vc2"],
    owner: "did:azienda:1",
    children: [
      {
        productId: "prod-2",
        typeId: "batteria",
        did: "did:prod:2",
        credentials: [],
        owner: "did:azienda:1",
        children: [],
      },
    ],
  },
  {
    productId: "prod-3",
    typeId: "tablet",
    did: "did:prod:3",
    serial: "TB789",
    credentials: [],
    owner: "did:azienda:2",
    children: [],
  },
];

describe("ProductList", () => {
  it("mostra tutti i prodotti in lista", () => {
    render(<ProductList products={products} />);
    expect(screen.getByText("smartphone")).toBeInTheDocument();
    expect(screen.getByText("tablet")).toBeInTheDocument();
    expect(screen.getByText("Seriale: ABC123")).toBeInTheDocument();
    expect(screen.getByText("Seriale: TB789")).toBeInTheDocument();
  });

  it("mostra badge VC solo per prodotti che hanno credentials", () => {
    render(<ProductList products={products} />);
    expect(screen.getByText("2 VC")).toBeInTheDocument();
    // L'altro prodotto non deve avere badge VC
    expect(screen.queryByText("0 VC")).not.toBeInTheDocument();
  });

  it("mostra i dettagli del prodotto selezionato al click", () => {
    render(<ProductList products={products} />);
    fireEvent.click(screen.getByText("smartphone"));
    // Cerca il pannello dettagli
    const detailsBox = screen.getByText("Dettagli Prodotto").closest("div");
    expect(detailsBox).toBeInTheDocument();
    expect(within(detailsBox!).getByText("smartphone")).toBeInTheDocument();
    expect(within(detailsBox!).getByText("prod-1")).toBeInTheDocument();
    expect(within(detailsBox!).getByText("did:prod:1")).toBeInTheDocument();
    expect(within(detailsBox!).getByText("ABC123")).toBeInTheDocument();
    // BOM/figli
    expect(within(detailsBox!).getByText("batteria")).toBeInTheDocument();
  });

  it("chiama onSelect quando clicchi su un prodotto", () => {
    const onSelect = jest.fn();
    render(<ProductList products={products} onSelect={onSelect} />);
    fireEvent.click(screen.getByText("tablet"));
    expect(onSelect).toHaveBeenCalledWith(products[1]);
  });
});
