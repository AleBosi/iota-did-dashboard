import React, { useMemo, useState } from "react";
import { useData } from "../../state/DataContext";
import { useUser } from "../../contexts/UserContext";
import AssignmentManager from "../Actors/Creator/AssignmentManager";

// Tipi minimi usati dal form (UI only)
type NewEventInput = {
  productId: string;
  operatorDid?: string;
  machineDid?: string;
  type: string;
  description?: string;
  bomComponent?: string;
  status: "pending" | "in_progress" | "completed";
};

const EventForm: React.FC = () => {
  const { currentActor } = useUser();
  const {
    // sorgenti dati centralizzate
    products = [],
    actors = [],
    events = [],
    // API di dominio centralizzate
    addEvent,
    notify,
  } = useData() as any;

  // --- form state (solo UI) ---
  const [productId, setProductId] = useState("");
  const [operatorDid, setOperatorDid] = useState("");
  const [machineDid, setMachineDid] = useState("");
  const [type, setType] = useState("");
  const [description, setDescription] = useState("");
  const [bomComponent, setBomComponent] = useState("");
  const [done, setDone] = useState(false);
  const [assignments, setAssignments] = useState<any[]>([]); // UI helper per AssignmentManager

  // liste filtrate
  const operatorList = useMemo(
    () => (actors || []).filter((a: any) => a.role === "operatore"),
    [actors]
  );
  const machineList = useMemo(
    () => (actors || []).filter((a: any) => a.role === "macchinario"),
    [actors]
  );

  // compat: AssignmentManager (UI) -> aggiorna stato locale
  const handleAssign = (ass: { eventId?: string; operatoreId?: string; macchinarioId?: string; operatorDid?: string; machineDid?: string }) => {
    // normalizzo su DID se forniti; altrimenti mappo da id -> DID
    const op = ass.operatorDid || ass.operatoreId && actors.find((a: any) => a.id === ass.operatoreId)?.did;
    const mc = ass.machineDid || ass.macchinarioId && actors.find((a: any) => a.id === ass.macchinarioId)?.did;
    if (op) setOperatorDid(op);
    if (mc) setMachineDid(mc);
    setAssignments((prev) => [...prev, ass]);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentActor?.did) {
      notify?.("Nessun actor autenticato.", "error");
      return;
    }
    if (!productId || !type) {
      notify?.("Compila almeno Prodotto e Tipo evento.", "error");
      return;
    }

    // mappa stato
    const status: NewEventInput["status"] = done ? "completed" : "pending";

    // payload per addEvent (dominio in DataContext)
    // NB: includiamo alias legacy per compatibilità selettori
    const payload: any = {
      productId,
      creatorDid: currentActor.did,
      type,
      description: description || undefined,
      bomComponent: bomComponent || undefined,
      status,
      // assegnazioni (nuovi campi)
      assignedOperatorDid: operatorDid || undefined,
      assignedMachineDid: machineDid || undefined,
      // alias legacy (operatore)
      operatorDid: operatorDid || undefined,
      assignedToDid: operatorDid || machineDid || undefined, // può essere op o macchina
      operatoreId: operatorDid || undefined, // legacy forte
      // alias legacy (macchina)
      machineDid: machineDid || undefined,
      // history iniziale (out-of-proof, verrà gestita dal dominio)
      history: [
        {
          ts: new Date().toISOString(),
          type: "create",
          actorDid: currentActor.did,
          note: description || null,
        },
      ],
    };

    // unica chiamata di dominio
    const created = addEvent(payload);

    // reset UI
    setProductId("");
    setOperatorDid("");
    setMachineDid("");
    setType("");
    setDescription("");
    setBomComponent("");
    setDone(false);
    setAssignments([]);

    notify?.(`Evento creato: ${created?.id || "(senza id visibile)"}`);
  };

  return (
    <form onSubmit={onSubmit} className="p-4 bg-white rounded-2xl shadow flex flex-col gap-3">
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Prodotto</span>
        <select
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          required
          className="border px-3 py-2 rounded-xl"
        >
          <option value="">-- Seleziona prodotto --</option>
          {(products || []).map((p: any) => (
            <option key={p.productId} value={p.productId}>
              {p.serial || p.productId} ({p.typeId})
            </option>
          ))}
        </select>
      </label>

      {/* Gestione assegnazioni via componente UI dedicato (no logica dominio) */}
      <AssignmentManager
        eventi={events || []}
        actors={actors || []}
        onAssign={handleAssign}
        assignments={assignments}
      />

      {/* Fallback/manuale: selettori diretti (comodi in test/dev) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Operatore (diretto)</span>
          <select
            value={operatorDid}
            onChange={(e) => setOperatorDid(e.target.value)}
            className="border px-3 py-2 rounded-xl"
          >
            <option value="">-- Seleziona operatore --</option>
            {operatorList.map((op: any) => (
              <option key={op.did} value={op.did}>
                {op.name} ({op.did})
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Macchinario (diretto)</span>
          <select
            value={machineDid}
            onChange={(e) => setMachineDid(e.target.value)}
            className="border px-3 py-2 rounded-xl"
          >
            <option value="">-- Seleziona macchinario --</option>
            {machineList.map((mc: any) => (
              <option key={mc.did} value={mc.did}>
                {mc.name} ({mc.did})
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Tipo evento</span>
        <input
          placeholder="Es: assemblaggio, collaudo, spedizione…"
          value={type}
          onChange={(e) => setType(e.target.value)}
          required
          className="border px-3 py-2 rounded-xl"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Descrizione</span>
        <input
          placeholder="Dettagli operativi"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border px-3 py-2 rounded-xl"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Componente BOM (opz.)</span>
        <input
          placeholder="Codice o nome componente"
          value={bomComponent}
          onChange={(e) => setBomComponent(e.target.value)}
          className="border px-3 py-2 rounded-xl"
        />
      </label>

      <label className="inline-flex items-center gap-2">
        <input
          type="checkbox"
          checked={done}
          onChange={(e) => setDone(e.target.checked)}
        />
        <span className="text-sm">Eseguito</span>
      </label>

      <button type="submit" className="bg-black text-white px-4 py-2 rounded-xl">
        Aggiungi evento
      </button>
    </form>
  );
};

export default EventForm;
