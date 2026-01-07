import { Syllable } from "../models/types";
import { getCorrection } from "./storage";

const SOFT_HYPHEN = "\u00AD";

type HyphenateFunction = (word: string) => string;

let hyphenatorPromise: Promise<HyphenateFunction> | null = null;

const decode = (() => {
  const utf16ledecoder = new TextDecoder("utf-16le");
  return (ui16: Uint16Array) => utf16ledecoder.decode(ui16);
})();

function createHyphenateFunction(
  buffer: ArrayBuffer,
  hyphenateFunc: (lm: number, rm: number, hc: number) => number
): HyphenateFunction {
  const wordStore = new Uint16Array(buffer, 0, 64);

  return (word: string) => {
    if (word.length > 61) return word;
    wordStore.set([...word].map((c) => c.charCodeAt(0)).concat([0]));
    const len = hyphenateFunc(2, 2, SOFT_HYPHEN.charCodeAt(0));
    if (len > 0) {
      return decode(new Uint16Array(buffer, 0, len));
    }
    return word;
  };
}

export async function initHyphenopoly(): Promise<HyphenateFunction> {
  if (hyphenatorPromise) {
    return hyphenatorPromise;
  }

  hyphenatorPromise = (async () => {
    const response = await fetch("./patterns/de-x-syllable.wasm");
    if (!response.ok) {
      throw new Error(`Failed to load WASM: ${response.status}`);
    }
    const wasmBuffer = await response.arrayBuffer();
    const wasmModule = await WebAssembly.instantiate(wasmBuffer);
    const exports = wasmModule.instance.exports as {
      mem: WebAssembly.Memory;
      hyphenate: (lm: number, rm: number, hc: number) => number;
    };

    return createHyphenateFunction(exports.mem.buffer, exports.hyphenate);
  })();

  return hyphenatorPromise;
}

export function parseToSyllables(hyphenatedText: string): Syllable[] {
  const syllables: Syllable[] = [];
  const parts = hyphenatedText.split(SOFT_HYPHEN);

  let currentIndex = 0;
  for (const part of parts) {
    if (part.length > 0) {
      syllables.push({
        text: part,
        startIndex: currentIndex,
      });
      currentIndex += part.length;
    }
  }

  return syllables;
}

export async function hyphenateWord(word: string): Promise<Syllable[]> {
  const correction = getCorrection(word);
  if (correction) {
    return correction.correctedSyllables.map((text, index, arr) => ({
      text,
      startIndex: arr.slice(0, index).reduce((sum, s) => sum + s.length, 0),
    }));
  }

  const hyphenator = await initHyphenopoly();
  const hyphenated = hyphenator(word);
  return parseToSyllables(hyphenated);
}

export async function hyphenateText(text: string): Promise<Syllable[][]> {
  const words = text.split(/(\s+)/);
  const result: Syllable[][] = [];

  for (const word of words) {
    if (/^\s+$/.test(word)) {
      result.push([{ text: word, startIndex: 0 }]);
    } else if (word.length > 0) {
      const syllables = await hyphenateWord(word);
      result.push(syllables);
    }
  }

  return result;
}

export function syllablesToText(syllables: Syllable[]): string {
  return syllables.map((s) => s.text).join("");
}

export function flattenSyllables(wordSyllables: Syllable[][]): Syllable[] {
  const result: Syllable[] = [];
  let currentIndex = 0;

  for (const word of wordSyllables) {
    for (const syllable of word) {
      result.push({
        text: syllable.text,
        startIndex: currentIndex,
      });
      currentIndex += syllable.text.length;
    }
  }

  return result;
}
