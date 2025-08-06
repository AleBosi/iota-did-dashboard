import { render, fireEvent, screen, waitFor } from "@testing-library/react";
import EventForm from "../EventForm";
import { Actor } from "../../../models/actor";
import { Product } from "../../../models/product";
import { Event } from "../../../models/event";

const mockProduct: Product = {
  productId: "PRD-001",
  typeId: "TYPE-A",
  did: "did:example:prod111",
  serial: "XYZ123",
  owner: "did:example:company001",
  children: [],
};

const mockOperatore: Actor = {
  id: "user222",
  did: "did:example:user222",
  name: "Mario Rossi",
  role: "operatore",
};

const mockMacchinario: Actor = {
  id: "machine333",
  did: "did:example:machine333",
  name: "Linea 1",
  role: "macchinario",
};

const mockEventi: Event[] = [
  {
    id: "EV-01",
    type: "avvio",
    description: "Avvio linea",
    productId: "PRD-001",
    operatoreId: "user222",
    macchinarioId: "machine333",
    creatorId: "did:example:creator999",
    date: new Date().toISOString(),
    done: false,
  },
];

describe("EventForm VC-centric", () => {
  it("emette evento e VC, richiama onCreate e resetta i campi", async () => {
    const handleCreate = jest.fn();
    render(
      <EventForm
        prodotti={[mockProduct]}
        actors={[mockOperatore, mockMacchinario]}
        eventi={mockEventi}
        creatorDid="did:example:creator999"
        onCreate={handleCreate}
      />
    );

    // Seleziona prodotto
    fireEvent.change(screen.getByLabelText(/Prodotto/i), {
      target: { value: mockProduct.productId },
    });
    // Seleziona operatore (select manuale)
    fireEvent.change(screen.getByLabelText(/Operatore \(diretto\)/i), {
      target: { value: mockOperatore.id },
    });
    // Seleziona macchinario (select manuale)
    fireEvent.change(screen.getByLabelText(/Macchinario \(diretto\)/i), {
      target: { value: mockMacchinario.id },
    });
    // Tipo evento
    fireEvent.change(screen.getByPlaceholderText(/Tipo evento/i), {
      target: { value: "Montaggio" },
    });
    // Descrizione
    fireEvent.change(screen.getByPlaceholderText(/Dettagli/i), {
      target: { value: "Assemblaggio iniziale" },
    });
    // Componente BOM
    fireEvent.change(screen.getByPlaceholderText(/\(opzionale\)/i), {
      target: { value: "Comp-01" },
    });
    // Eseguito (checkbox)
    fireEvent.click(screen.getByLabelText(/Eseguito/i));

    // Submit
    fireEvent.click(screen.getByRole("button", { name: /Aggiungi evento/i }));

    // Attendi chiamata callback e badge VC preview
    await waitFor(() => {
      expect(handleCreate).toHaveBeenCalled();
      expect(screen.getByText(/VC emessa/i)).toBeInTheDocument();
    });

    // Verifica struttura evento creato
    const event = handleCreate.mock.calls[0][0];
    expect(event.product.productId).toBe(mockProduct.productId);
    expect(event.operatore.name).toBe(mockOperatore.name);
    expect(event.macchinario.name).toBe(mockMacchinario.name);
    expect(event.type).toBe("Montaggio");
    expect(event.done).toBe(true);
    expect(event.vc).toBeDefined();
    expect(event.vc["@context"]).toBeDefined();

    // Verifica reset campi (il select prodotto torna vuoto)
    expect(screen.getByPlaceholderText(/Tipo evento/i)).toHaveValue("");
    expect(screen.getByPlaceholderText(/Dettagli/i)).toHaveValue("");
    expect(screen.getByPlaceholderText(/\(opzionale\)/i)).toHaveValue("");
  });

  it("matcha lo snapshot del form", () => {
    const { asFragment } = render(
      <EventForm
        prodotti={[mockProduct]}
        actors={[mockOperatore, mockMacchinario]}
        eventi={mockEventi}
        creatorDid="did:example:creator999"
        onCreate={() => {}}
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
