import { render, screen, fireEvent } from "@testing-library/react";
import ProductBOMTree from "../ProductBOMTree";
import { Product } from "../../../models/product";

const treeProducts: Product[] = [
  {
    productId: "prod-1",
    typeId: "Smartphone",
    did: "did:prod:1",
    credentials: ["vc1", "vc2"],
    owner: "did:azienda:1",
    children: [
      {
        productId: "prod-2",
        typeId: "Batteria",
        did: "did:prod:2",
        credentials: ["vc-bat"],
        owner: "did:azienda:1",
        children: [],
      },
      {
        productId: "prod-3",
        typeId: "Scheda Madre",
        did: "did:prod:3",
        credentials: [],
        owner: "did:azienda:1",
        children: [],
      },
    ],
  },
  {
    productId: "prod-4",
    typeId: "Tablet",
    did: "did:prod:4",
    credentials: [],
    owner: "did:azienda:2",
    children: [],
  },
];

describe("ProductBOMTree", () => {
  it("mostra tutti i prodotti radice", () => {
    render(<ProductBOMTree products={treeProducts} />);
    expect(screen.getByText("Smartphone")).toBeInTheDocument();
    expect(screen.getByText("Tablet")).toBeInTheDocument();
  });

  it("espande e mostra i componenti figli", () => {
    render(<ProductBOMTree products={treeProducts} />);
    fireEvent.click(screen.getAllByText("[+]")[0]);
    expect(screen.getByText("Batteria")).toBeInTheDocument();
    expect(screen.getByText("Scheda Madre")).toBeInTheDocument();
  });

  it("chiama onAddChild quando premi il bottone", () => {
    const onAddChild = jest.fn();
    render(<ProductBOMTree products={treeProducts} onAddChild={onAddChild} />);
    const addBtn = screen.getAllByText("+ Sotto-componente")[0];
    fireEvent.click(addBtn);
    expect(onAddChild).toHaveBeenCalledWith("prod-1");
  });

  it("chiama onSelect quando clicchi il prodotto", () => {
    const onSelect = jest.fn();
    render(<ProductBOMTree products={treeProducts} onSelect={onSelect} />);
    fireEvent.click(screen.getByText("Tablet"));
    expect(onSelect).toHaveBeenCalledWith(treeProducts[1]);
  });

  it("mostra badge VC se presenti", () => {
    render(<ProductBOMTree products={treeProducts} />);
    // Badge radice (Smartphone)
    expect(screen.getByText("2 VC")).toBeInTheDocument();
    // Espandi Smartphone per vedere il badge del figlio
    fireEvent.click(screen.getAllByText("[+]")[0]);
    expect(screen.getByText("1 VC")).toBeInTheDocument();
  });

  it("collassa e riespande i nodi", () => {
    render(<ProductBOMTree products={treeProducts} />);
    // Espandi e poi collassa Smartphone
    const toggleBtn = screen.getAllByText("[+]")[0];
    fireEvent.click(toggleBtn);
    expect(screen.getByText("Batteria")).toBeInTheDocument();
    fireEvent.click(screen.getByText("[-]"));
    expect(screen.queryByText("Batteria")).not.toBeInTheDocument();
  });
});
