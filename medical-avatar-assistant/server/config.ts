import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const envPath = path.resolve(__dirname, "../.env");

/** Re-read .env so BEY_AGENT_ID changes apply without a manual server restart. */
export function reloadEnv(): void {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath, override: true });
  }
}

export function optional(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value || undefined;
}

export function getConfig() {
  reloadEnv();
  return {
    port: Number(process.env.PORT ?? 3001),
    beyApiKey: optional("BEY_API_KEY"),
    beyAgentId: optional("BEY_AGENT_ID"),
    beyAvatarId: optional("BEY_AVATAR_ID"),
    agentName: process.env.BEY_AGENT_NAME?.trim() || "medicare-ai",
    autoProvisionAgent: process.env.AUTO_PROVISION_AGENT !== "false",
    beyApiBaseUrl: "https://api.bey.dev",
    embedBaseUrl: "https://bey.chat",
    clientOrigin: process.env.CLIENT_ORIGIN ?? "http://localhost:5173",
    envPath,
  };
}

export type AppConfig = ReturnType<typeof getConfig>;

export function assertApiKey(config: AppConfig = getConfig()): string {
  const value = config.beyApiKey;
  if (!value) {
    throw new Error("Missing required environment variable: BEY_API_KEY");
  }
  return value;
}
