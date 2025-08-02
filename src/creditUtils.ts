// creditUtils.ts

const ADMIN_KEY = "admin_credits";
const USERS_KEY = "user_credits";

// Crediti admin: oggetto { saldo: number }
export function getAdminCredits() {
  let credits = localStorage.getItem(ADMIN_KEY);
  if (!credits) {
    localStorage.setItem(ADMIN_KEY, JSON.stringify({ saldo: 10000 }));
    credits = localStorage.getItem(ADMIN_KEY);
  }
  return JSON.parse(credits);
}
export function setAdminCredits(saldo) {
  localStorage.setItem(ADMIN_KEY, JSON.stringify({ saldo }));
}

// Lista utenti noti
export function getKnownUsers() {
  let all = getAllUsers();
  return Object.keys(all);
}

// Tutto lo storico e saldo utente (per ogni DID)
export function getAllUsers() {
  let data = localStorage.getItem(USERS_KEY);
  if (!data) {
    localStorage.setItem(USERS_KEY, JSON.stringify({}));
    data = localStorage.getItem(USERS_KEY);
  }
  return JSON.parse(data);
}

export function setAllUsers(obj) {
  localStorage.setItem(USERS_KEY, JSON.stringify(obj));
}

export function getUserCredits(did) {
  const all = getAllUsers();
  if (!all[did]) {
    all[did] = { saldo: 0, storico: [] };
    setAllUsers(all);
  }
  return all[did];
}
export function setUserCredits(did, obj) {
  const all = getAllUsers();
  all[did] = obj;
  setAllUsers(all);
}

// Assegna crediti: da admin -> did
export function assignCredits(did, delta, descrizione = "Assegnazione admin") {
  if (!did || !delta || isNaN(delta) || delta <= 0) return false;
  const admin = getAdminCredits();
  if (admin.saldo < delta) throw new Error("Crediti amministratore insufficienti!");
  // aggiorna admin
  setAdminCredits(admin.saldo - delta);
  // aggiorna user
  const user = getUserCredits(did);
  user.saldo += delta;
  user.storico.push({
    tipo: "assegnazione",
    descrizione,
    delta,
    data: new Date().toISOString()
  });
  setUserCredits(did, user);
  return true;
}

// Consuma 1 credito per azione utente
export function consumeCredit(did, descrizione = "Azione utente") {
  const user = getUserCredits(did);
  if (user.saldo < 1) throw new Error("Crediti insufficienti");
  user.saldo -= 1;
  user.storico.push({
    tipo: "consumo",
    descrizione,
    delta: -1,
    data: new Date().toISOString()
  });
  setUserCredits(did, user);
  return true;
}

// Ritorna storico movimenti di un utente (array)
export function getUserHistory(did) {
  const user = getUserCredits(did);
  return user.storico || [];
}