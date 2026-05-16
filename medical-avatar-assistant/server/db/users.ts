import { randomUUID } from "crypto";
import { getDb } from "./db.js";
import { mapUserRow } from "./rowMappers.js";
import type { DbUser } from "./types.js";

export function upsertUser(input: {
  googleSub: string;
  email: string;
  name: string;
  pictureUrl?: string | null;
}): DbUser {
  const db = getDb();
  const existing = db
    .prepare(`SELECT * FROM users WHERE google_sub = ?`)
    .get(input.googleSub) as Parameters<typeof mapUserRow>[0] | undefined;

  if (existing) {
    db.prepare(
      `UPDATE users SET email = ?, name = ?, picture_url = ?, updated_at = datetime('now')
       WHERE google_sub = ?`,
    ).run(input.email, input.name, input.pictureUrl ?? null, input.googleSub);
    const updated = db
      .prepare(`SELECT * FROM users WHERE google_sub = ?`)
      .get(input.googleSub) as Parameters<typeof mapUserRow>[0];
    return mapUserRow(updated);
  }

  const id = randomUUID();
  db.prepare(
    `INSERT INTO users (id, google_sub, email, name, picture_url)
     VALUES (?, ?, ?, ?, ?)`,
  ).run(id, input.googleSub, input.email, input.name, input.pictureUrl ?? null);

  const row = db
    .prepare(`SELECT * FROM users WHERE id = ?`)
    .get(id) as Parameters<typeof mapUserRow>[0];
  return mapUserRow(row);
}

export function findUserById(id: string): DbUser | null {
  const db = getDb();
  const row = db
    .prepare(`SELECT * FROM users WHERE id = ?`)
    .get(id) as Parameters<typeof mapUserRow>[0] | undefined;
  return row ? mapUserRow(row) : null;
}
