import { render, fireEvent, screen, waitFor } from "@testing-library/react";
import EventForm from "../EventForm";

// MOCK PRODUCT/ACTOR/VC
const mockProduct = {
  productId: "PRD-001",
  typeId: "TYPE-A",
  did: "did:example:prod111",
  serial: "XYZ123",
  owner: "did:example:company001",
  credentials: [],
  children: [],
  } 

const mockOperatore = {
  id: "user222",
  did: "did:example:user222",
  name: "Mario Rossi",
  role: "operatore", // <-- deve essere esattamente "operatore"
  credentials: [],
  } as const;

const mockMacchinario = {
  id: "machine333",
  did: "did:example:machine333",
  name: "Linea 1",
  role: "macchinario", // <-- deve essere esattamente "macchinario"
  credentials: [],
  } as const;

describe("EventForm VC-centric", () => {
  it("emette evento e VC, richiama onCreate e resetta i campi", async () => {
    const handleCreate = jest.fn();
    render(
      <EventForm
        prodotti={[mockProduct]}
        operatori={[mockOperatore]}
        macchinari={[mockMacchinario]}
        creatorDid="did:example:creator999"
        onCreate={handleCreate}
      />
    );

    // Seleziona prodotto
    fireEvent.change(screen.getByLabelText(/Prodotto/i), {
      target: { value: mockProduct.productId },
    });
    // Seleziona operatore
    fireEvent.change(screen.getByLabelText(/Operatore/i), {
      target: { value: mockOperatore.did },
    });
    // Seleziona macchinario
    fireEvent.change(screen.getByLabelText(/Macchinario/i), {
      target: { value: mockMacchinario.did },
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
    expect(event.operatore.did).toBe(mockOperatore.did);
    expect(event.macchinario.did).toBe(mockMacchinario.did);
    expect(event.type).toBe("Montaggio");
    expect(event.done).toBe(true);
    expect(event.vc).toBeDefined();
    expect(event.vc["@context"]).toBeDefined();

    // Verifica reset campi (il select prodotto torna vuoto)
    expect(screen.getByPlaceholderText(/Tipo evento/i)).toHaveValue("");
    expect(screen.getByPlaceholderText(/Dettagli/i)).toHaveValue("");
    expect(screen.getByPlaceholderText(/\(opzionale\)/i)).toHaveValue("");
  });
});
