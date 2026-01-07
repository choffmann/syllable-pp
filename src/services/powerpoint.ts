import { Syllable } from "../models/types";

export interface TextSelection {
  text: string;
}

export async function getSelectedText(): Promise<TextSelection | null> {
  return new Promise((resolve) => {
    Office.context.document.getSelectedDataAsync(
      Office.CoercionType.Text,
      (result) => {
        if (result.status === Office.AsyncResultStatus.Succeeded) {
          const text = result.value as string;
          if (text && text.trim().length > 0) {
            resolve({ text: text.trim() });
          } else {
            resolve(null);
          }
        } else {
          console.error("Failed to get selected text:", result.error?.message);
          resolve(null);
        }
      }
    );
  });
}

export async function applySyllableColors(
  syllables: Syllable[],
  colors: string[]
): Promise<boolean> {
  return new Promise((resolve) => {
    PowerPoint.run(async (context) => {
      try {
        const textRange = context.presentation.getSelectedTextRange();
        textRange.load("text");
        await context.sync();

        const newText = syllables.map((s) => s.text).join("");
        textRange.text = newText;
        await context.sync();

        let position = 0;
        for (let i = 0; i < syllables.length; i++) {
          const syllable = syllables[i];
          if (/^\s+$/.test(syllable.text)) {
            position += syllable.text.length;
            continue;
          }

          const color = colors[i % colors.length];
          const subRange = textRange.getSubstring(position, syllable.text.length);
          subRange.font.color = color;
          position += syllable.text.length;
        }

        await context.sync();
        resolve(true);
      } catch (error) {
        console.error("Failed to apply syllable colors:", error);
        resolve(false);
      }
    });
  });
}

export async function replaceSelectedText(text: string): Promise<boolean> {
  return new Promise((resolve) => {
    Office.context.document.setSelectedDataAsync(
      text,
      { coercionType: Office.CoercionType.Text },
      (result) => {
        if (result.status === Office.AsyncResultStatus.Succeeded) {
          resolve(true);
        } else {
          console.error("Failed to replace text:", result.error?.message);
          resolve(false);
        }
      }
    );
  });
}
