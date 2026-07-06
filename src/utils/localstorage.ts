export function getLocalStorage<T>(key: string): T | null {
  const data = localStorage.getItem(key);
  try {
    return JSON.parse(data as string) as T;
  } catch (e) {
    console.error('Error parsing localStorage item:', e);
    return null;
  }
}

export function setLocalStorage(key: string, data: any) {
  localStorage.setItem(key, JSON.stringify(data));
}
