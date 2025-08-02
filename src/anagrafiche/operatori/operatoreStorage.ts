import { Operatore } from "./OperatoreType";

const STORAGE_KEY = "anagrafica_operatori";

export function loadOperatori(): Operatore[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveOperatori(arr: Operatore[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
}
