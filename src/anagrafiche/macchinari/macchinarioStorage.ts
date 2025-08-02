// src/anagrafiche/macchinari/macchinarioStorage.ts

export const loadMacchinari = () => {
  const data = localStorage.getItem("macchinari");
  return data ? JSON.parse(data) : [];
};

export const saveMacchinari = (macchinari: any[]) => {
  localStorage.setItem("macchinari", JSON.stringify(macchinari));
};
