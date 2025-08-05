import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ProductForm from "../ProductForm";
import { Product } from "../../../models/product";

describe("ProductForm", () => {
  const mockOnCreate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renderizza correttamente tutti i campi e il bottone", () => {
    render(<ProductForm onCreate={mockOnCreate} />);
    expect(screen.getByPlaceholderText(/nome prodotto/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/seriale/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/owner did/i)).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  test("non submit senza nome o seriale", async () => {
    render(<ProductForm onCreate={mockOnCreate} />);
    fireEvent.click(screen.getByRole("button"));
    await waitFor(() => {
      expect(mockOnCreate).not.toHaveBeenCalled();
    });
  });

  test("submit chiama onCreate con dati corretti e resetta campi", async () => {
    render(<ProductForm onCreate={mockOnCreate} />);
    fireEvent.change(screen.getByPlaceholderText(/nome prodotto/i), { target: { value: "TipoSmartphone" } });
    fireEvent.change(screen.getByPlaceholderText(/seriale/i), { target: { value: "SN12345" } });
    fireEvent.change(screen.getByPlaceholderText(/owner did/i), { target: { value: "did:iota:evm:owner" } });

    fireEvent.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(mockOnCreate).toHaveBeenCalledTimes(1);
      const productArg = mockOnCreate.mock.calls[0][0];
      expect(productArg.typeId).toBe("TipoSmartphone");
      expect(productArg.serial).toBe("SN12345");
      expect(productArg.owner).toBe("did:iota:evm:owner");
      expect(productArg.productId).toBeDefined();
      expect(productArg.did).toBeDefined();
      expect(Array.isArray(productArg.children)).toBe(true);
      expect(Array.isArray(productArg.credentials)).toBe(true);
    });

    expect(screen.getByPlaceholderText(/nome prodotto/i)).toHaveValue("");
    expect(screen.getByPlaceholderText(/seriale/i)).toHaveValue("");
    expect(screen.getByPlaceholderText(/owner did/i)).toHaveValue("");
  });

  test("bottone cambia testo se viene passato parentProduct", () => {
    const parentProduct: Product = {
      productId: "prod-parent",
      typeId: "padre",
      did: "did:prod:parent",
      children: [],
      credentials: [],
    };
    render(<ProductForm parentProduct={parentProduct} onCreate={mockOnCreate} />);
    expect(screen.getByRole("button")).toHaveTextContent(/aggiungi sotto-componente/i);
  });

  // Snapshot
  test("matcha lo snapshot", () => {
    const { asFragment } = render(<ProductForm onCreate={mockOnCreate} />);
    expect(asFragment()).toMatchSnapshot();
  });
});
