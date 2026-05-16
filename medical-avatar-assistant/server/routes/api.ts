import { Router } from "express";
import { assertApiKey, config } from "../config.js";
import { verifyApiKey } from "../bey/client.js";
import { listAgents } from "../bey/client.js";
import { resolveSessionAgent } from "../services/agentResolver.js";

export const apiRouter = Router();

apiRouter.get("/health", (_req, res) => {
  res.json({
    ok: true,
    hasApiKey: Boolean(config.beyApiKey),
  });
});

apiRouter.get("/session", async (_req, res) => {
  try {
    const apiKey = assertApiKey();
    await verifyApiKey(apiKey);
    const { agent, embedUrl, provisioned } = await resolveSessionAgent(apiKey);

    res.json({
      connected: true,
      agent: {
        id: agent.id,
        name: agent.name,
        greeting: agent.greeting ?? null,
        language: agent.language ?? "en-US",
      },
      embedUrl,
      provisioned,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown server error";

    res.json({
      connected: false,
      error: message,
    });
  }
});

apiRouter.get("/agents", async (_req, res) => {
  try {
    const apiKey = assertApiKey();
    const agents = await listAgents(apiKey);

    res.json({
      agents: agents.map((a) => ({
        id: a.id,
        name: a.name,
        avatarId: a.avatar_id,
      })),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to list agents";
    res.status(500).json({ error: message });
  }
});
