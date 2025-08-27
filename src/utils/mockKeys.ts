// Chiavi centralizzate di localStorage per i dati mock
export const LSK = {
  session: "iota.trustup.session",
  // dominio dati
  aziende: "iota.trustup.data.aziende",
  actors: "iota.trustup.data.actors",
  products: "iota.trustup.data.products",
  productTypes: "iota.trustup.data.productTypes",
  events: "iota.trustup.data.events",
  vcs: "iota.trustup.data.vcs",
  dids: "iota.trustup.data.dids",
  credits: "iota.trustup.data.credits",
  // flag di bootstrap iniziale
  seeded: "iota.trustup.data._seeded",
} as const;
