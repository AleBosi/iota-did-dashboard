import { render, screen, fireEvent } from "@testing-library/react";
import AssignmentManager from "../AssignmentManager";
import type { Actor } from "../../../../models/actor";
import type { Event } from "../../../../models/event";

const opRole: Actor["role"] = "operatore";
const macRole: Actor["role"] = "macchinario";
const adminRole: Actor["role"] = "admin";

const mockActors: Actor[] = [
  { id: "op1", name: "Mario Rossi", did: "did:iota:1", role: opRole },
  { id: "mac1", name: "Pressa A", did: "did:iota:2", role: macRole },
  { id: "admin1", name: "Admin", did: "did:iota:3", role: adminRole },
];

const mockEvents: Event[] = [
  {
    id: "ev1",
    type: "Produzione",
    description: "Lavorazione lotto 1",
    productId: "prod-123",
    operatoreId: "op1",
    macchinarioId: "mac1",
    date: "2024-01-01T10:00:00.000Z",
    creatorId: "admin1",
    done: false,
  },
  {
    id: "ev2",
    type: "Collaudo",
    description: "Test finale",
    productId: "prod-456",
    operatoreId: "",
    macchinarioId: "",
    date: "2024-01-02T10:00:00.000Z",
    creatorId: "admin1",
    done: false,
  },
];

describe("AssignmentManager", () => {
  it("rende i select e il bottone Assegna", () => {
    render(
      <AssignmentManager
        eventi={mockEvents}
        actors={mockActors}
        onAssign={jest.fn()}
        assignments={[]}
      />
    );

    expect(screen.getByText(/assegna operatore/i)).toBeInTheDocument();
    expect(screen.getAllByRole("combobox")).toHaveLength(3);
    expect(screen.getByRole("button", { name: /assegna/i })).toBeDisabled();
  });

  it("abilita il bottone solo se selezionato almeno evento e uno tra operatore/macchinario", () => {
    render(
      <AssignmentManager
        eventi={mockEvents}
        actors={mockActors}
        onAssign={jest.fn()}
        assignments={[]}
      />
    );

    const selects = screen.getAllByRole("combobox");
    const selectEvento = selects[0];
    const selectOperatore = selects[1];
    const selectMacchinario = selects[2];
    const btnAssegna = screen.getByRole("button", { name: /assegna/i });

    expect(btnAssegna).toBeDisabled();

    fireEvent.change(selectEvento, { target: { value: "ev1" } });
    expect(btnAssegna).toBeDisabled();

    fireEvent.change(selectOperatore, { target: { value: "op1" } });
    expect(btnAssegna).toBeEnabled();

    fireEvent.change(selectOperatore, { target: { value: "" } });
    fireEvent.change(selectMacchinario, { target: { value: "mac1" } });
    expect(btnAssegna).toBeEnabled();
  });

  it("chiama onAssign con i dati corretti e pulisce i campi", () => {
    const mockOnAssign = jest.fn();
    render(
      <AssignmentManager
        eventi={mockEvents}
        actors={mockActors}
        onAssign={mockOnAssign}
        assignments={[]}
      />
    );

    const selects = screen.getAllByRole("combobox");
    const selectEvento = selects[0];
    const selectOperatore = selects[1];
    const selectMacchinario = selects[2];
    const btnAssegna = screen.getByRole("button", { name: /assegna/i });

    fireEvent.change(selectEvento, { target: { value: "ev1" } });
    fireEvent.change(selectOperatore, { target: { value: "op1" } });
    fireEvent.change(selectMacchinario, { target: { value: "mac1" } });

    fireEvent.click(btnAssegna);

    expect(mockOnAssign).toHaveBeenCalledWith({
      eventId: "ev1",
      operatoreId: "op1",
      macchinarioId: "mac1",
    });

    expect(selectOperatore).toHaveValue("");
    expect(selectMacchinario).toHaveValue("");
  });

  it("mostra le assegnazioni già effettuate", () => {
    render(
      <AssignmentManager
        eventi={mockEvents}
        actors={mockActors}
        onAssign={jest.fn()}
        assignments={[
          { eventId: "ev1", operatoreId: "op1", macchinarioId: "mac1" },
        ]}
      />
    );
    const assignmentsList = screen.getByText(/assegnazioni effettuate/i).closest("div");
    expect(assignmentsList).toHaveTextContent(/lavorazione lotto 1/i);
    expect(assignmentsList).toHaveTextContent(/Mario Rossi/i);
    expect(assignmentsList).toHaveTextContent(/Pressa A/i);
  });
});
