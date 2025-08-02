// Una funzione che crea un "macchinario" (JS style, no tipi TypeScript)
export function createMacchinario({
  id = "",
  did = "",
  matricola = "",
  nome = "",
  linea = "",
  reparto = "",
  stabilimento = "",
  stato = "Attivo"
} = {}) {
  return { id, did, matricola, nome, linea, reparto, stabilimento, stato };
}

// Un esempio di macchinario (puoi usarlo come mock/test)
export const MacchinarioMock = createMacchinario({ nome: "Demo" });
