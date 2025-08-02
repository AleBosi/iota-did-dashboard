// src/anagrafiche/operatori/operatoreStorage.ts

export const loadOperatori = () => {
  const data = localStorage.getItem("operatori");
  return data ? JSON.parse(data) : [];
};

export const saveOperatori = (operatori: any[]) => {
  localStorage.setItem("operatori", JSON.stringify(operatori));
};
