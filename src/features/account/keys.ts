import { sql } from "@/lib/db/client";
import { decrypt, encrypt } from "@/lib/crypto";

export type KeyStatus = { last4: string; setAt: string } | null;

/** What Settings shows: which key is set, never the key itself. */
export async function getKeyStatus(userId: string): Promise<KeyStatus> {
  const rows = await sql`
    select gemini_key_last4 as last4, gemini_key_set_at as "setAt"
    from users
    where id = ${userId} and gemini_key_encrypted is not null
  `;
  return rows.length > 0 ? (rows[0] as { last4: string; setAt: string }) : null;
}

/** The decrypted key, for making a request on this user's behalf. */
export async function getGeminiKey(userId: string): Promise<string | null> {
  const rows = await sql`
    select gemini_key_encrypted as enc from users where id = ${userId}
  `;
  const enc = rows[0]?.enc as string | null | undefined;
  return enc ? decrypt(enc) : null;
}

export async function saveGeminiKey(userId: string, key: string): Promise<void> {
  await sql`
    update users
    set gemini_key_encrypted = ${encrypt(key)},
        gemini_key_last4     = ${key.slice(-4)},
        gemini_key_set_at    = now()
    where id = ${userId}
  `;
}

export async function clearGeminiKey(userId: string): Promise<void> {
  await sql`
    update users
    set gemini_key_encrypted = null,
        gemini_key_last4     = null,
        gemini_key_set_at    = null
    where id = ${userId}
  `;
}
