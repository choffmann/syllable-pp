/* global document, Office, PowerPoint */

import { Syllable, SyllableCorrection } from "../models/types";
import { initHyphenopoly, hyphenateText } from "../services/hyphenation";
import { getSelectedText, applySyllableColors } from "../services/powerpoint";
import {
  saveCorrection,
  getAllCorrections,
  deleteCorrection,
  loadSettings,
  saveSettings,
} from "../services/storage";
import {
  checkLicenseStatus,
  validateLicense,
  saveLicense,
  incrementTrialUsage,
  getTrialRemaining,
  TRIAL_LIMIT,
} from "../services/license";

let currentWordSyllables: Syllable[][] = [];
let currentText = "";
let isInitialized = false;

Office.onReady(async (info) => {
  if (info.host === Office.HostType.PowerPoint) {
    document.getElementById("sideload-msg")!.style.display = "none";
    const version = typeof __APP_VERSION__ !== "undefined" ? __APP_VERSION__ : "develop";
    document.getElementById("app-version")!.textContent = version;

    setupLicenseListeners();

    const licenseStatus = checkLicenseStatus();
    if (licenseStatus.isValid || !licenseStatus.isTrialExpired) {
      showApp(licenseStatus.isValid);
    } else {
      showLicenseScreen();
    }
  }
});

function showLicenseScreen(): void {
  document.getElementById("license-section")!.style.display = "flex";
  document.getElementById("app-body")!.style.display = "none";
}

function showApp(isLicensed: boolean): void {
  document.getElementById("license-section")!.style.display = "none";
  document.getElementById("app-body")!.style.display = "block";

  setupEventListeners();
  loadSavedSettings();
  renderCorrectionsList();
  updateTrialBanner(isLicensed);

  showStatus("Initialisiere Silbentrennung...", "info");
  initHyphenopoly()
    .then(() => {
      isInitialized = true;
      hideStatus();
    })
    .catch((error) => {
      showStatus("Fehler beim Laden der Silbentrennung", "error");
      console.error("Failed to initialize Hyphenopoly:", error);
    });
}

function updateTrialBanner(isLicensed: boolean): void {
  const banner = document.getElementById("trial-banner")!;
  const remainingEl = document.getElementById("trial-remaining")!;

  if (isLicensed) {
    banner.style.display = "none";
    return;
  }

  const remaining = getTrialRemaining();
  banner.style.display = "flex";
  remainingEl.textContent = String(remaining);

  if (remaining <= 3) {
    banner.classList.add("expired");
  } else {
    banner.classList.remove("expired");
  }
}

function setupLicenseListeners(): void {
  const licenseInput = document.getElementById("license-input") as HTMLInputElement;
  const btnActivate = document.getElementById("btn-activate") as HTMLButtonElement;
  const licenseError = document.getElementById("license-error") as HTMLElement;
  const btnEnterLicense = document.getElementById("btn-enter-license") as HTMLButtonElement;

  licenseInput?.addEventListener("input", () => {
    licenseError.style.display = "none";
    licenseInput.classList.remove("invalid");

    // Auto-format with dashes
    let value = licenseInput.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (value.length > 16) value = value.slice(0, 16);

    const parts = [];
    for (let i = 0; i < value.length; i += 4) {
      parts.push(value.slice(i, i + 4));
    }
    licenseInput.value = parts.join("-");
  });

  btnActivate?.addEventListener("click", () => {
    const key = licenseInput.value;

    if (validateLicense(key)) {
      saveLicense(key);
      showApp(true);
    } else {
      licenseError.style.display = "block";
      licenseInput.classList.add("invalid");
    }
  });

  licenseInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      btnActivate?.click();
    }
  });

  btnEnterLicense?.addEventListener("click", () => {
    showLicenseScreen();
  });
}

function setupEventListeners(): void {
  document.getElementById("btn-preview")?.addEventListener("click", handlePreview);
  document.getElementById("btn-apply")?.addEventListener("click", handleApply);
  document.getElementById("btn-save-correction")?.addEventListener("click", handleSaveCorrection);

  document.getElementById("color1")?.addEventListener("change", handleColorChange);
  document.getElementById("color2")?.addEventListener("change", handleColorChange);
}

function loadSavedSettings(): void {
  const settings = loadSettings();
  const color1Input = document.getElementById("color1") as HTMLInputElement;
  const color2Input = document.getElementById("color2") as HTMLInputElement;

  if (color1Input && settings.colors[0]) {
    color1Input.value = settings.colors[0];
  }
  if (color2Input && settings.colors[1]) {
    color2Input.value = settings.colors[1];
  }
}

function handleColorChange(): void {
  const colors = getColors();
  saveSettings({ colors, language: "de-x-syllable" });
  if (currentWordSyllables.length > 0) {
    renderPreview(currentWordSyllables, colors);
  }
}

function getColors(): string[] {
  const color1 = (document.getElementById("color1") as HTMLInputElement)?.value || "#E53935";
  const color2 = (document.getElementById("color2") as HTMLInputElement)?.value || "#1E88E5";
  return [color1, color2];
}

async function handlePreview(): Promise<void> {
  if (!isInitialized) {
    showStatus("Silbentrennung wird noch geladen...", "info");
    return;
  }

  const btnPreview = document.getElementById("btn-preview") as HTMLButtonElement;
  btnPreview.disabled = true;

  try {
    const selection = await getSelectedText();
    if (!selection) {
      showStatus("Bitte markiere zuerst Text in PowerPoint", "error");
      btnPreview.disabled = false;
      return;
    }

    currentText = selection.text;
    showStatus("Analysiere Text...", "info");

    currentWordSyllables = await hyphenateText(currentText);
    const colors = getColors();

    renderPreview(currentWordSyllables, colors);
    renderSyllableEditor(currentWordSyllables);

    document.getElementById("editor-section")!.style.display = "block";
    (document.getElementById("btn-apply") as HTMLButtonElement).disabled = false;

    hideStatus();
  } catch (error) {
    showStatus("Fehler bei der Silbentrennung", "error");
    console.error("Preview error:", error);
  }

  btnPreview.disabled = false;
}

async function handleApply(): Promise<void> {
  if (currentWordSyllables.length === 0) {
    showStatus("Keine Silben zum Anwenden", "error");
    return;
  }

  const licenseStatus = checkLicenseStatus();

  // Check if trial expired (and not licensed)
  if (!licenseStatus.isValid && licenseStatus.isTrialExpired) {
    showLicenseScreen();
    return;
  }

  const btnApply = document.getElementById("btn-apply") as HTMLButtonElement;
  btnApply.disabled = true;

  try {
    showStatus("Wende Silbenfarben an...", "info");

    const colors = getColors();

    const success = await applySyllableColors(currentWordSyllables, colors);

    if (success) {
      // Increment trial usage if not licensed
      if (!licenseStatus.isValid) {
        incrementTrialUsage();
        updateTrialBanner(false);

        // Check if trial just expired
        if (getTrialRemaining() === 0) {
          showStatus("Testversion abgelaufen! Bitte Lizenz eingeben.", "error");
        } else {
          showStatus("Silbenfarben erfolgreich angewendet!", "success");
          setTimeout(hideStatus, 2000);
        }
      } else {
        showStatus("Silbenfarben erfolgreich angewendet!", "success");
        setTimeout(hideStatus, 2000);
      }
    } else {
      showStatus("Fehler beim Anwenden der Farben", "error");
    }
  } catch (error) {
    showStatus("Fehler beim Anwenden", "error");
    console.error("Apply error:", error);
  }

  btnApply.disabled = false;
}

function handleSaveCorrection(): void {
  const words = currentText.split(/\s+/).filter((w) => w.length > 0);
  const editedSyllables = getSyllablesFromEditor();

  if (words.length === 1 && editedSyllables.length > 0) {
    const word = words[0];
    const originalSyllables =
      currentWordSyllables.length > 0
        ? currentWordSyllables[0].map((s) => s.text)
        : [];

    const correction: SyllableCorrection = {
      originalWord: word,
      originalSyllables,
      correctedSyllables: editedSyllables,
      timestamp: Date.now(),
    };

    saveCorrection(correction);
    renderCorrectionsList();
    showStatus(`Korrektur für "${word}" gespeichert`, "success");
    setTimeout(hideStatus, 2000);
  } else if (words.length > 1) {
    showStatus("Korrekturen nur für einzelne Wörter möglich", "error");
  }
}

function renderPreview(wordSyllables: Syllable[][], colors: string[]): void {
  const container = document.getElementById("preview-container")!;
  container.innerHTML = "";

  for (const word of wordSyllables) {
    const wordSpan = document.createElement("span");
    wordSpan.className = "word-group";

    let colorIndex = 0;
    for (const syllable of word) {
      const span = document.createElement("span");
      span.className = "syllable-preview";

      if (/^\s+$/.test(syllable.text)) {
        span.textContent = syllable.text;
      } else {
        span.textContent = syllable.text;
        span.style.color = colors[colorIndex % colors.length];
        colorIndex++;
      }

      wordSpan.appendChild(span);
    }

    container.appendChild(wordSpan);
  }
}

function renderSyllableEditor(wordSyllables: Syllable[][]): void {
  const container = document.getElementById("syllable-editor")!;
  container.innerHTML = "";

  for (let wi = 0; wi < wordSyllables.length; wi++) {
    const word = wordSyllables[wi];

    for (let si = 0; si < word.length; si++) {
      const syllable = word[si];

      if (/^\s+$/.test(syllable.text)) {
        const spacer = document.createElement("span");
        spacer.className = "syllable-chip whitespace";
        spacer.textContent = "␣";
        container.appendChild(spacer);
      } else {
        const chip = document.createElement("input");
        chip.type = "text";
        chip.value = syllable.text;
        chip.className = "syllable-chip";
        chip.dataset.wordIndex = String(wi);
        chip.dataset.syllableIndex = String(si);

        // Merge with previous syllable on Backspace at start
        chip.addEventListener("keydown", (e) => {
          const target = e.target as HTMLInputElement;
          const wIdx = parseInt(target.dataset.wordIndex || "0", 10);
          const sIdx = parseInt(target.dataset.syllableIndex || "0", 10);

          if (
            e.key === "Backspace" &&
            target.selectionStart === 0 &&
            target.selectionEnd === 0 &&
            sIdx > 0
          ) {
            e.preventDefault();
            const prevText = currentWordSyllables[wIdx][sIdx - 1].text;
            const currText = currentWordSyllables[wIdx][sIdx].text;
            currentWordSyllables[wIdx][sIdx - 1].text = prevText + currText;
            currentWordSyllables[wIdx].splice(sIdx, 1);
            renderSyllableEditor(currentWordSyllables);
            renderPreview(currentWordSyllables, getColors());
            // Focus previous chip at merge point
            setTimeout(() => {
              const chips = document.querySelectorAll(
                `.syllable-chip[data-word-index="${wIdx}"]`
              ) as NodeListOf<HTMLInputElement>;
              if (chips[sIdx - 1]) {
                chips[sIdx - 1].focus();
                chips[sIdx - 1].setSelectionRange(prevText.length, prevText.length);
              }
            }, 0);
          }
        });

        chip.addEventListener("input", (e) => {
          const target = e.target as HTMLInputElement;
          const wIdx = parseInt(target.dataset.wordIndex || "0", 10);
          const sIdx = parseInt(target.dataset.syllableIndex || "0", 10);

          if (currentWordSyllables[wIdx] && currentWordSyllables[wIdx][sIdx]) {
            const newValue = target.value;

            // Split syllable with "|"
            if (newValue.includes("|")) {
              const parts = newValue.split("|").filter((p) => p.length > 0);
              if (parts.length > 1) {
                const newSyllables = parts.map((text, i) => ({
                  text,
                  startIndex: currentWordSyllables[wIdx][sIdx].startIndex + i,
                }));
                currentWordSyllables[wIdx].splice(sIdx, 1, ...newSyllables);
                renderSyllableEditor(currentWordSyllables);
                renderPreview(currentWordSyllables, getColors());
                return;
              }
            }

            // Merge with previous syllable if empty (Backspace)
            if (newValue === "" && sIdx > 0) {
              const prevSyllable = currentWordSyllables[wIdx][sIdx - 1];
              currentWordSyllables[wIdx].splice(sIdx, 1);
              renderSyllableEditor(currentWordSyllables);
              renderPreview(currentWordSyllables, getColors());
              // Focus previous chip
              setTimeout(() => {
                const chips = document.querySelectorAll(
                  `.syllable-chip[data-word-index="${wIdx}"]`
                ) as NodeListOf<HTMLInputElement>;
                if (chips[sIdx - 1]) {
                  chips[sIdx - 1].focus();
                  chips[sIdx - 1].setSelectionRange(
                    prevSyllable.text.length,
                    prevSyllable.text.length
                  );
                }
              }, 0);
              return;
            }

            currentWordSyllables[wIdx][sIdx].text = newValue;
            renderPreview(currentWordSyllables, getColors());
          }
        });

        container.appendChild(chip);
      }
    }
  }
}

function getSyllablesFromEditor(): string[] {
  const chips = document.querySelectorAll(
    ".syllable-chip:not(.whitespace)"
  ) as NodeListOf<HTMLInputElement>;
  return Array.from(chips)
    .map((chip) => chip.value)
    .filter((v) => v.length > 0);
}

function renderCorrectionsList(): void {
  const container = document.getElementById("corrections-list")!;
  const corrections = getAllCorrections();

  if (corrections.length === 0) {
    container.innerHTML =
      '<span class="ms-font-s placeholder-text">Keine Korrekturen gespeichert</span>';
    return;
  }

  container.innerHTML = "";

  for (const correction of corrections) {
    const item = document.createElement("div");
    item.className = "correction-item";

    const info = document.createElement("div");
    info.innerHTML = `
      <div class="correction-word">${escapeHtml(correction.originalWord)}</div>
      <div class="correction-syllables">${escapeHtml(correction.correctedSyllables.join("-"))}</div>
    `;

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "correction-delete";
    deleteBtn.textContent = "×";
    deleteBtn.title = "Korrektur löschen";
    deleteBtn.addEventListener("click", () => {
      deleteCorrection(correction.originalWord);
      renderCorrectionsList();
      showStatus("Korrektur gelöscht", "success");
      setTimeout(hideStatus, 2000);
    });

    item.appendChild(info);
    item.appendChild(deleteBtn);
    container.appendChild(item);
  }
}

function showStatus(message: string, type: "success" | "error" | "info"): void {
  const statusEl = document.getElementById("status-message")!;
  statusEl.textContent = message;
  statusEl.className = `status-message ${type}`;
  statusEl.style.display = "block";
}

function hideStatus(): void {
  const statusEl = document.getElementById("status-message")!;
  statusEl.style.display = "none";
}

function escapeHtml(text: string): string {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
