export interface Macchinario {
  id: string;
  did: string;
  matricola: string;
  nome: string;
  linea: string;
  reparto: string;
  stabilimento: string;
  stato: "Attivo" | "Manutenzione" | "Fermo";
}
