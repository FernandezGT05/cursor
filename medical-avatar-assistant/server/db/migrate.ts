import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { getDb } from "./db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function runMigrations(): void {
  const db = getDb();
  const sqlPath = path.join(__dirname, "migrations", "001_initial.sql");
  const sql = fs.readFileSync(sqlPath, "utf8");
  db.exec(sql);
}
