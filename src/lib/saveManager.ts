import type { PersistedGameState } from "@/types/game";
import { encryptSaveData, decryptSaveData, isValidSaveDataJson } from "./crypto";

const SAVE_FILE_EXTENSION = ".studyrpg";
const SAVE_MIME_TYPE = "application/json";

export interface SaveExportResult {
  success: boolean;
  filename?: string;
  error?: string;
}

export interface SaveImportResult {
  success: boolean;
  data?: PersistedGameState;
  error?: string;
}

/**
 * Export game state to encrypted file
 */
export function exportSaveData(
  gameState: PersistedGameState,
  password: string,
): { blob: Blob; filename: string } {
  const encrypted = encryptSaveData(gameState, password);
  const jsonString = JSON.stringify(encrypted, null, 2);
  const blob = new Blob([jsonString], { type: SAVE_MIME_TYPE });

  // Generate filename with timestamp
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const filename = `study-rpg-save-${timestamp}${SAVE_FILE_EXTENSION}`;

  return { blob, filename };
}

/**
 * Trigger file download
 */
export function downloadFile(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Read file content as text
 */
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
}

/**
 * Import and decrypt save data from file content
 */
export function importSaveData(fileContent: string, password: string): SaveImportResult {
  // Validate JSON structure
  if (!isValidSaveDataJson(fileContent)) {
    return {
      success: false,
      error: "無効なセーブデータ形式です。",
    };
  }

  const encryptedData = JSON.parse(fileContent);

  // Decrypt
  const decrypted = decryptSaveData(encryptedData, password);

  if (!decrypted) {
    return {
      success: false,
      error: "パスワードが違うか、データが破損しています。",
    };
  }

  // Validate that it looks like a valid game state
  const state = decrypted as PersistedGameState;
  if (!isValidGameState(state)) {
    return {
      success: false,
      error: "セーブデータの構造が無効です。",
    };
  }

  return {
    success: true,
    data: state,
  };
}

/**
 * Basic validation of game state structure
 */
function isValidGameState(state: unknown): state is PersistedGameState {
  if (typeof state !== "object" || state === null) return false;

  const s = state as Record<string, unknown>;

  // Check required top-level properties
  if (!Array.isArray(s.tasks)) return false;
  if (!Array.isArray(s.folders)) return false;
  if (typeof s.timer !== "object" || s.timer === null) return false;
  if (typeof s.monster !== "object" || s.monster === null) return false;
  if (typeof s.resources !== "object" || s.resources === null) return false;
  if (typeof s.raid !== "object" || s.raid === null) return false;
  if (!Array.isArray(s.equipmentInventory)) return false;
  if (typeof s.equippedSlots !== "object" || s.equippedSlots === null) return false;

  return true;
}

/**
 * Get file extension for save files
 */
export function getSaveFileExtension(): string {
  return SAVE_FILE_EXTENSION;
}
