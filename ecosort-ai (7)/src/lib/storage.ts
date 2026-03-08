import { WasteItem, setCustomApiKey } from './gemini';

const HISTORY_KEY = 'ecosort_history';
const API_KEY_STORAGE_KEY = 'ecosort_gemini_api_key';

export function saveToHistory(item: WasteItem) {
  const history = getHistory();
  // Ensure we don't save duplicate images if the item already has one, or handle it gracefully
  const newItem = { 
    ...item, 
    timestamp: Date.now(), 
    id: crypto.randomUUID() 
  };
  
  // Limit image size if needed (optional optimization, skipping for now to ensure quality)
  
  const updatedHistory = [newItem, ...history].slice(0, 50); // Keep last 50 items
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
  return updatedHistory;
}

export function updateHistoryItem(id: string, updates: Partial<WasteItem>) {
  const history = getHistory();
  const updatedHistory = history.map(item => 
    item.id === id ? { ...item, ...updates } : item
  );
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
  return updatedHistory;
}

export function getHistory(): WasteItem[] {
  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error("Failed to parse history", e);
    return [];
  }
}

export function clearHistory() {
  localStorage.removeItem(HISTORY_KEY);
}

export function saveApiKey(key: string) {
  localStorage.setItem(API_KEY_STORAGE_KEY, key);
  setCustomApiKey(key);
}

export function getStoredApiKey() {
  return localStorage.getItem(API_KEY_STORAGE_KEY);
}

export function removeApiKey() {
  localStorage.removeItem(API_KEY_STORAGE_KEY);
  setCustomApiKey(''); // Reset in memory
}

// Initialize API key from storage on load
const storedKey = getStoredApiKey();
if (storedKey) {
  setCustomApiKey(storedKey);
}
