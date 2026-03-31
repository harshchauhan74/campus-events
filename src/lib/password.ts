import { randomBytes, scryptSync } from "crypto";

const SALT_LENGTH = 16;
const KEY_LENGTH = 64;

/**
 * Hash a password using scrypt with a random salt.
 * Returns a string in the format: salt:hash (both hex-encoded)
 */
export function hashPassword(password: string): string {
  const salt = randomBytes(SALT_LENGTH).toString("hex");
  const hash = scryptSync(password, salt, KEY_LENGTH).toString("hex");
  return `${salt}:${hash}`;
}

/**
 * Verify a password against a stored hash.
 * Returns true if the password matches.
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, hash] = storedHash.split(":");
  if (!salt || !hash) return false;
  const testHash = scryptSync(password, salt, KEY_LENGTH).toString("hex");
  // Constant-time comparison to prevent timing attacks
  if (testHash.length !== hash.length) return false;
  let result = 0;
  for (let i = 0; i < testHash.length; i++) {
    result |= testHash.charCodeAt(i) ^ hash.charCodeAt(i);
  }
  return result === 0;
}

/**
 * Validate password strength.
 * Returns null if valid, or an error message string.
 */
export function validatePassword(password: string): string | null {
  if (password.length < 6) return "Password must be at least 6 characters";
  if (password.length > 128) return "Password must be less than 128 characters";
  if (!/[A-Za-z]/.test(password)) return "Password must contain at least one letter";
  if (!/[0-9]/.test(password)) return "Password must contain at least one number";
  return null;
}
