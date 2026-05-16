import "dotenv/config";

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function optional(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value || undefined;
}

export const config = {
  port: Number(process.env.PORT ?? 3001),
  beyApiKey: optional("BEY_API_KEY"),
  beyAgentId: optional("BEY_AGENT_ID"),
  beyAvatarId: optional("BEY_AVATAR_ID"),
  agentName: process.env.BEY_AGENT_NAME?.trim() || "dr.vita",
  autoProvisionAgent: process.env.AUTO_PROVISION_AGENT !== "false",
  beyApiBaseUrl: "https://api.bey.dev",
  embedBaseUrl: "https://bey.chat",
  clientOrigin: process.env.CLIENT_ORIGIN ?? "http://localhost:5173",
} as const;

export function assertApiKey(): string {
  return required("BEY_API_KEY");
}
