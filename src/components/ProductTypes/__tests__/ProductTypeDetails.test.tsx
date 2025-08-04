import { render, screen } from "@testing-library/react";
import ProductTypeDetails from "../ProductTypeDetails";
import { ProductType } from "../../../models/productType";

describe("ProductTypeDetails", () => {
  const sampleType: ProductType = {
    id: "1234",
    name: "Tipo Test",
    description: "Descrizione test",
  };

  test("renderizza correttamente i dettagli", () => {
    render(<ProductTypeDetails type={sampleType} />);
    expect(screen.getByText(/nome:/i)).toBeInTheDocument();
    expect(screen.getByText(sampleType.name)).toBeInTheDocument();
    expect(screen.getByText(/id:/i)).toBeInTheDocument();
    expect(screen.getByText(sampleType.id)).toBeInTheDocument();
    expect(screen.getByText(/descrizione:/i)).toBeInTheDocument();
    expect(screen.getByText(sampleType.description!)).toBeInTheDocument();
  });

  test("non renderizza nulla se type è null o undefined", () => {
    const { container } = render(<ProductTypeDetails type={null as any} />);
    expect(container).toBeEmptyDOMElement();
  });

  test("non mostra descrizione se non presente", () => {
    const typeNoDesc: ProductType = { id: "5678", name: "No Desc" };
    render(<ProductTypeDetails type={typeNoDesc} />);
    expect(screen.queryByText(/descrizione:/i)).toBeNull();
  });

  // Snapshot
  test("matcha lo snapshot con descrizione", () => {
    const { asFragment } = render(<ProductTypeDetails type={sampleType} />);
    expect(asFragment()).toMatchSnapshot();
  });

  test("matcha lo snapshot senza descrizione", () => {
    const typeNoDesc: ProductType = { id: "5678", name: "No Desc" };
    const { asFragment } = render(<ProductTypeDetails type={typeNoDesc} />);
    expect(asFragment()).toMatchSnapshot();
  });
});
