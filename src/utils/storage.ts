export function safeGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function safeSet<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function pushItem<T>(key: string, item: T) {
  const arr = safeGet<T[]>(key, []);
  arr.push(item);
  safeSet(key, arr);
}

export function uid(prefix = "") {
  return `${prefix}${Math.random().toString(36).slice(2, 8)}-${Date.now().toString(36)}`;
}
