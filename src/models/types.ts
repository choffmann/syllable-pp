export interface Syllable {
  text: string;
  startIndex: number;
}

export interface SyllableCorrection {
  originalWord: string;
  originalSyllables: string[];
  correctedSyllables: string[];
  timestamp: number;
}

export interface CorrectionStore {
  version: number;
  corrections: Record<string, SyllableCorrection>;
}

export interface UserSettings {
  colors: string[];
  language: string;
}

export const DEFAULT_SETTINGS: UserSettings = {
  colors: ["#E53935", "#1E88E5"],
  language: "de-x-syllable",
};
