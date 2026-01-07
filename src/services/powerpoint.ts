import { Syllable } from "../models/types";

export interface TextSelection {
  text: string;
}

function isLetterSyllable(text: string): boolean {
  return /\p{L}/u.test(text);
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

async function getTextRangeToModify(
  context: PowerPoint.RequestContext
): Promise<PowerPoint.TextRange | null> {
  // First try: get selected shapes and use their text frame
  try {
    const shapes = context.presentation.getSelectedShapes();
    shapes.load("items/textFrame/textRange/text");
    await context.sync();

    if (shapes.items.length > 0) {
      const textRange = shapes.items[0].textFrame.textRange;
      if (textRange.text) {
        return textRange;
      }
    }
  } catch (e) {
    console.log("Shape approach failed:", e);
  }

  // Second try: get selected text range directly
  try {
    const selectedTextRange = context.presentation.getSelectedTextRange();
    selectedTextRange.load("text");
    await context.sync();
    if (selectedTextRange.text) {
      return selectedTextRange;
    }
  } catch (e) {
    console.log("TextRange approach failed:", e);
  }

  return null;
}

export async function applySyllableColors(
  wordSyllables: Syllable[][],
  colors: string[]
): Promise<boolean> {
  return new Promise((resolve) => {
    PowerPoint.run(async (context) => {
      try {
        const textRange = await getTextRangeToModify(context);

        if (!textRange) {
          console.error("No text or shape selected");
          resolve(false);
          return;
        }

        // Only apply colors, don't modify text to preserve formatting
        let position = 0;
        for (const word of wordSyllables) {
          let colorIndex = 0;
          for (const syllable of word) {
            if (/^\s+$/.test(syllable.text)) {
              position += syllable.text.length;
              continue;
            }

            let color: string;
            if (isLetterSyllable(syllable.text)) {
              color = colors[colorIndex % colors.length];
              colorIndex++;
            } else {
              // Non-letter syllables always use color 1
              color = colors[0];
            }

            const subRange = textRange.getSubstring(position, syllable.text.length);
            subRange.font.color = color;
            position += syllable.text.length;
          }
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
