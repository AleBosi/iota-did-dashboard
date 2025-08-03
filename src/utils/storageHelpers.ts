export function saveItem<T>(key: string, item: T) {
  localStorage.setItem(key, JSON.stringify(item));
}

export function loadItem<T>(key: string): T | null {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
}

export function removeItem(key: string) {
  localStorage.removeItem(key);
}
