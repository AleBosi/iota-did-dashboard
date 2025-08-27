// src/models/event.ts

// Manteniamo il modello esistente e aggiungiamo SOLO campi opzionali e helper
// per lo stato/notes. È retro-compatibile: i vecchi dati continuano a funzionare.

export type AssignmentStatus = "queued" | "in_progress" | "done" | "cancelled";

export interface EventNote {
  id: string;
  text: string;
  createdAt: string;     // ISO
  performedByDid: string;
}

export interface Event {
  id: string;
  productId: string;         // ID prodotto collegato (obbligatorio)
  operatoreId: string;       // ID operatore coinvolto
  macchinarioId: string;     // ID macchinario coinvolto
  type: string;              // es: "Assemblaggio", "Controllo", "Assegnazione"
  description: string;
  date: string;              // ISO
  creatorId: string;         // DID del creator che ha creato l’evento
  done?: boolean;            // true se eseguito
  bomComponent?: string;     // opzionale, componente specifico
  proofId?: string;          // se firmerai evento come VC
  vcIds?: string[];          // VC associate/notarizzate collegate a questo evento

  // ---- Estensioni opzionali (non rompenti)
  status?: AssignmentStatus; // se assente: deriviamo da `done` (done=true => "done", altrimenti "queued")
  notes?: EventNote[];       // elenco note append-only
}

/**
 * Ritorna lo stato "logico" dell'evento:
 *  - Se c'è ev.status lo usiamo
 *  - Altrimenti fallback: done ? "done" : "queued"
 */
export function effectiveStatus(ev: Event): AssignmentStatus {
  if (ev.status) return ev.status;
  return ev.done ? "done" : "queued";
}

/** Regole di transizione della state machine (assignment) */
export function canTransition(current: AssignmentStatus, next: AssignmentStatus): boolean {
  if (current === "queued" && next === "in_progress") return true;
  if (current === "in_progress" && (next === "done" || next === "cancelled")) return true;
  // annullamento prima di iniziare
  if (current === "queued" && next === "cancelled") return true;
  return false;
}

// Alias non rompente per coerenza con codice esistente
export type EventItem = Event;
