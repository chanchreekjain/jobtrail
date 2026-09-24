import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto";

/**
 * Encrypts small secrets (API keys) before they go in the database.
 *
 * AES-256-GCM: GCM adds an authentication tag, so a tampered ciphertext
 * fails to decrypt rather than quietly returning rubbish. Every value
 * gets a fresh random IV, so encrypting the same key twice produces
 * different ciphertext.
 *
 * What this does and doesn't protect: a stolen database backup is
 * useless on its own. Someone who gets the server AND this secret can
 * decrypt. That's the honest limit, and it's why the UI tells users
 * where to revoke their key.
 */
if (!process.env.ENCRYPTION_KEY) {
  throw new Error("ENCRYPTION_KEY is not set");
}

// scrypt stretches the passphrase into a 32-byte key. The salt is fixed
// because we need the same key every time — this is key derivation, not
// password hashing.
const KEY = scryptSync(process.env.ENCRYPTION_KEY, "jobtrail-secrets", 32);

export function encrypt(plaintext: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", KEY, iv);
  const enc = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  // iv.tag.ciphertext, each base64, in one column.
  return [
    iv.toString("base64"),
    cipher.getAuthTag().toString("base64"),
    enc.toString("base64"),
  ].join(".");
}

export function decrypt(stored: string): string | null {
  try {
    const [iv, tag, data] = stored.split(".");
    if (!iv || !tag || !data) return null;

    const decipher = createDecipheriv("aes-256-gcm", KEY, Buffer.from(iv, "base64"));
    decipher.setAuthTag(Buffer.from(tag, "base64"));
    return Buffer.concat([
      decipher.update(Buffer.from(data, "base64")),
      decipher.final(),
    ]).toString("utf8");
  } catch {
    // Wrong secret, or tampered data. Either way there's no key to use.
    return null;
  }
}
