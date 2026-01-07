const LICENSE_STORAGE_KEY = "syllable-pp-license";
const TRIAL_USAGE_KEY = "syllable-pp-trial-usage";
const SECRET_SALT = "SiLb3nTr3worng2025!"; // Keep this secret

export const TRIAL_LIMIT = 10;

export interface LicenseStatus {
  isValid: boolean;
  licenseKey: string | null;
  trialRemaining: number;
  isTrialExpired: boolean;
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

function toBase36Block(num: number, length: number): string {
  return num.toString(36).toUpperCase().padStart(length, "0").slice(-length);
}

function calculateChecksum(blocks: string[]): string {
  const combined = blocks.join("") + SECRET_SALT;
  const hash = hashCode(combined);
  return toBase36Block(hash, 4);
}

export function validateLicense(key: string): boolean {
  if (!key) return false;

  const cleaned = key.toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (cleaned.length !== 16) return false;

  const blocks = [
    cleaned.slice(0, 4),
    cleaned.slice(4, 8),
    cleaned.slice(8, 12),
    cleaned.slice(12, 16),
  ];

  const expectedChecksum = calculateChecksum(blocks.slice(0, 3));
  return blocks[3] === expectedChecksum;
}

export function formatLicenseKey(key: string): string {
  const cleaned = key.toUpperCase().replace(/[^A-Z0-9]/g, "");
  const blocks = [];
  for (let i = 0; i < cleaned.length && i < 16; i += 4) {
    blocks.push(cleaned.slice(i, i + 4));
  }
  return blocks.join("-");
}

export function saveLicense(key: string): void {
  const formatted = formatLicenseKey(key);
  localStorage.setItem(LICENSE_STORAGE_KEY, formatted);
}

export function getSavedLicense(): string | null {
  return localStorage.getItem(LICENSE_STORAGE_KEY);
}

export function removeLicense(): void {
  localStorage.removeItem(LICENSE_STORAGE_KEY);
}

export function getTrialUsage(): number {
  const usage = localStorage.getItem(TRIAL_USAGE_KEY);
  return usage ? parseInt(usage, 10) : 0;
}

export function incrementTrialUsage(): number {
  const current = getTrialUsage();
  const newCount = current + 1;
  localStorage.setItem(TRIAL_USAGE_KEY, String(newCount));
  return newCount;
}

export function getTrialRemaining(): number {
  return Math.max(0, TRIAL_LIMIT - getTrialUsage());
}

export function isTrialExpired(): boolean {
  return getTrialUsage() >= TRIAL_LIMIT;
}

export function checkLicenseStatus(): LicenseStatus {
  const savedKey = getSavedLicense();
  const trialRemaining = getTrialRemaining();
  const trialExpired = isTrialExpired();

  if (savedKey && validateLicense(savedKey)) {
    return {
      isValid: true,
      licenseKey: savedKey,
      trialRemaining,
      isTrialExpired: false,
    };
  }

  return {
    isValid: false,
    licenseKey: null,
    trialRemaining,
    isTrialExpired: trialExpired,
  };
}

export function canUseApp(): boolean {
  const status = checkLicenseStatus();
  return status.isValid || !status.isTrialExpired;
}
