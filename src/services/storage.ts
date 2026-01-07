import {
  CorrectionStore,
  SyllableCorrection,
  UserSettings,
  DEFAULT_SETTINGS,
} from "../models/types";

const CORRECTIONS_KEY = "syllable-corrections";
const SETTINGS_KEY = "syllable-settings";

export function loadCorrections(): CorrectionStore {
  try {
    const stored = localStorage.getItem(CORRECTIONS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error("Failed to load corrections:", e);
  }
  return { version: 1, corrections: {} };
}

export function saveCorrection(correction: SyllableCorrection): void {
  const store = loadCorrections();
  const key = normalizeWord(correction.originalWord);
  store.corrections[key] = correction;
  localStorage.setItem(CORRECTIONS_KEY, JSON.stringify(store));
}

export function getCorrection(word: string): SyllableCorrection | null {
  const store = loadCorrections();
  const key = normalizeWord(word);
  return store.corrections[key] || null;
}

export function deleteCorrection(word: string): void {
  const store = loadCorrections();
  const key = normalizeWord(word);
  delete store.corrections[key];
  localStorage.setItem(CORRECTIONS_KEY, JSON.stringify(store));
}

export function getAllCorrections(): SyllableCorrection[] {
  const store = loadCorrections();
  return Object.values(store.corrections);
}

export function loadSettings(): UserSettings {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    }
  } catch (e) {
    console.error("Failed to load settings:", e);
  }
  return { ...DEFAULT_SETTINGS };
}

export function saveSettings(settings: UserSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

function normalizeWord(word: string): string {
  return word.trim().toLowerCase();
}
