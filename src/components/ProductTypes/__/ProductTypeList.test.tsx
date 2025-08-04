import { render, screen, fireEvent } from "@testing-library/react";
import ProductTypeList from "../ProductTypeList";
import { ProductType } from "../../../models/productType";

describe("ProductTypeList", () => {
  const sampleTypes: ProductType[] = [
    { id: "1", name: "Tipo 1", description: "Desc 1" },
    { id: "2", name: "Tipo 2" }, // senza descrizione
  ];

  test("renderizza lista con nomi e descrizioni", () => {
    render(<ProductTypeList types={sampleTypes} />);
    expect(screen.getByText("Tipo 1")).toBeInTheDocument();
    expect(screen.getByText("Desc 1")).toBeInTheDocument();
    expect(screen.getByText("Tipo 2")).toBeInTheDocument();
  });

  test("cliccando su un item mostra dettagli e chiama onSelect", () => {
    const mockOnSelect = jest.fn();
    render(<ProductTypeList types={sampleTypes} onSelect={mockOnSelect} />);

    fireEvent.click(screen.getByText("Tipo 1"));

    expect(mockOnSelect).toHaveBeenCalledWith(sampleTypes[0]);

    expect(screen.getByText(/nome:/i).parentElement).toHaveTextContent("Tipo 1");
    expect(screen.getByText(/descrizione:/i).parentElement).toHaveTextContent("Desc 1");
  });

  test("inizialmente non mostra dettagli", () => {
    const { container } = render(<ProductTypeList types={sampleTypes} />);
    expect(container.querySelector("div.w-1\\/2 > div")).toBeNull();
  });

  test("matcha lo snapshot", () => {
    const { asFragment } = render(<ProductTypeList types={sampleTypes} />);
    expect(asFragment()).toMatchSnapshot();
  });
});
