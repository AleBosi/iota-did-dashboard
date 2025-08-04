import { render, screen, fireEvent } from "@testing-library/react";
import AddNodeModal from "../AddNodeModal";

// Mock dnd-kit: puoi toglierlo se vuoi testare DnD reale, ma per test base serve solo la renderizzazione
jest.mock("@dnd-kit/core", () => ({
  DndContext: ({ children }: any) => <div>{children}</div>,
  closestCenter: jest.fn(),
  PointerSensor: jest.fn(),
  useSensor: () => ({}),
  useSensors: () => ([]),
}));
jest.mock("@dnd-kit/sortable", () => ({
  SortableContext: ({ children }: any) => <div>{children}</div>,
  verticalListSortingStrategy: jest.fn(),
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: jest.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  }),
}));
jest.mock("@dnd-kit/utilities", () => ({
  CSS: { Transform: { toString: () => "" } }
}));

describe("AddNodeModal", () => {
  const onConfirm = jest.fn();
  const onCancel = jest.fn();
  const types = [
    { id: "t1", name: "Tipo1" },
    { id: "t2", name: "Tipo2" }
  ];
  const parentPath = "Root";

  beforeEach(() => {
    onConfirm.mockClear();
    onCancel.mockClear();
  });

  it("renderizza il titolo, il select e l'input per nuovo nodo", () => {
    render(<AddNodeModal parentPath={parentPath} onConfirm={onConfirm} onCancel={onCancel} types={types} />);
    expect(screen.getByText(/aggiungi sotto-struttura/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/tipologia prodotto/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/nome nuovo componente/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /\+ nuovo/i })).toBeInTheDocument();
  });

  it("aggiunge un nuovo nodo radice alla struttura", () => {
    render(<AddNodeModal parentPath={parentPath} onConfirm={onConfirm} onCancel={onCancel} types={types} />);
    fireEvent.change(screen.getByPlaceholderText(/nome nuovo componente/i), { target: { value: "Comp1" } });
    fireEvent.click(screen.getByRole("button", { name: /\+ nuovo/i }));
    expect(screen.getByText("Comp1")).toBeInTheDocument();
  });

  it("permette di aggiungere un sotto-componente", () => {
    render(<AddNodeModal parentPath={parentPath} onConfirm={onConfirm} onCancel={onCancel} types={types} />);
    fireEvent.change(screen.getByPlaceholderText(/nome nuovo componente/i), { target: { value: "Comp1" } });
    fireEvent.click(screen.getByRole("button", { name: /\+ nuovo/i }));
    fireEvent.click(screen.getByRole("button", { name: /\+ sotto-componente/i }));
    expect(screen.getAllByText(/nuovo componente/i).length).toBeGreaterThan(0);
  });

  it("chiama onConfirm con la struttura e il tipo selezionato", () => {
    render(<AddNodeModal parentPath={parentPath} onConfirm={onConfirm} onCancel={onCancel} types={types} />);
    fireEvent.change(screen.getByPlaceholderText(/nome nuovo componente/i), { target: { value: "Comp1" } });
    fireEvent.click(screen.getByRole("button", { name: /\+ nuovo/i }));
    fireEvent.click(screen.getByRole("button", { name: /salva struttura/i }));
    expect(onConfirm).toHaveBeenCalled();
    // Puoi aggiungere check sul tipo se vuoi
    const [tree, selectedTypeId] = onConfirm.mock.calls[0];
    expect(tree[0].name).toBe("Comp1");
    expect(selectedTypeId).toBe("t1");
  });

  it("chiama onCancel quando clicchi Annulla", () => {
    render(<AddNodeModal parentPath={parentPath} onConfirm={onConfirm} onCancel={onCancel} types={types} />);
    fireEvent.click(screen.getByRole("button", { name: /annulla/i }));
    expect(onCancel).toHaveBeenCalled();
  });
});
