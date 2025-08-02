// src/anagrafiche/operatori/OperatoreFactory.ts

export function createOperatore({
  id = "",
  nome = "",
  ruolo = "",
  email = "",
  stato = "Attivo"
} = {}) {
  return { id, nome, ruolo, email, stato };
}

export const OperatoreMock = createOperatore({ nome: "Mario Rossi", ruolo: "Responsabile", email: "mario.rossi@email.com" });
