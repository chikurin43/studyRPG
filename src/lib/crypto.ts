/**
 * Simple password-based XOR encryption for save data
 * Not cryptographically secure, but sufficient for basic save data protection
 */

export interface EncryptedSaveData {
  version: number;
  encrypted: string; // Base64 encoded encrypted data
}

function stringToBytes(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

function bytesToString(bytes: Uint8Array): string {
  return new TextDecoder().decode(bytes);
}

function base64Encode(bytes: Uint8Array): string {
  const binString = Array.from(bytes, (b) => String.fromCharCode(b)).join("");
  return btoa(binString);
}

function base64Decode(base64: string): Uint8Array {
  const binString = atob(base64);
  return Uint8Array.from(binString, (c) => c.charCodeAt(0));
}

/**
 * Generate XOR key from password
 */
function generateKey(password: string, length: number): Uint8Array {
  const key = new Uint8Array(length);
  const passwordBytes = stringToBytes(password);

  for (let i = 0; i < length; i++) {
    key[i] = passwordBytes[i % passwordBytes.length] ^ (i * 7 + 13);
  }

  return key;
}

/**
 * XOR encrypt/decrypt data
 */
function xorEncrypt(data: Uint8Array, password: string): Uint8Array {
  const key = generateKey(password, data.length);
  const result = new Uint8Array(data.length);

  for (let i = 0; i < data.length; i++) {
    result[i] = data[i] ^ key[i];
  }

  return result;
}

/**
 * Encrypt save data with password
 */
export function encryptSaveData(data: object, password: string): EncryptedSaveData {
  const jsonString = JSON.stringify(data);
  const dataBytes = stringToBytes(jsonString);
  const encryptedBytes = xorEncrypt(dataBytes, password);

  return {
    version: 1,
    encrypted: base64Encode(encryptedBytes),
  };
}

/**
 * Decrypt save data with password
 * Returns null if decryption fails
 */
export function decryptSaveData(
  encryptedData: EncryptedSaveData,
  password: string,
): object | null {
  try {
    if (encryptedData.version !== 1) {
      throw new Error(`Unsupported save data version: ${encryptedData.version}`);
    }

    const encryptedBytes = base64Decode(encryptedData.encrypted);
    const decryptedBytes = xorEncrypt(encryptedBytes, password);
    const jsonString = bytesToString(decryptedBytes);

    return JSON.parse(jsonString);
  } catch (error) {
    return null;
  }
}

/**
 * Validate if a string is a valid encrypted save data JSON
 */
export function isValidSaveDataJson(str: string): boolean {
  try {
    const parsed = JSON.parse(str);
    return (
      typeof parsed === "object" &&
      parsed !== null &&
      typeof parsed.version === "number" &&
      typeof parsed.encrypted === "string"
    );
  } catch {
    return false;
  }
}
