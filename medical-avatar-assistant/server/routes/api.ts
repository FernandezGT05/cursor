import { Router } from "express";
import { assertApiKey, getConfig } from "../config.js";
import { verifyApiKey, listAgents } from "../bey/client.js";
import {
  AGENT_SPECIALTY_IDS,
  isAgentSpecialtyId,
  SPECIALTY_LABELS,
} from "../services/agentSpecialties.js";
import {
  isCatalogAgentId,
  resolveCatalogAgentBeyId,
} from "../services/agentCatalog.js";
import { resolveSpecialtySession } from "../services/specialtySession.js";
import {
  getSpecialtyPrompts,
  getSpecialtySystemPrompt,
} from "../services/specialtyPrompts.js";

export const apiRouter = Router();

apiRouter.get("/health", (_req, res) => {
  const config = getConfig();
  res.json({
    ok: true,
    hasApiKey: Boolean(config.beyApiKey),
    beyAgentId: config.beyAgentId ?? null,
  });
});

apiRouter.get("/agent-specialties", (_req, res) => {
  res.json({
    specialties: AGENT_SPECIALTY_IDS.map((id) => ({
      id,
      label: SPECIALTY_LABELS[id],
    })),
  });
});

/** Preview prompt text for a specialty (for admin/debug; prompts are applied server-side). */
apiRouter.get("/specialty-prompts/:specialty", (req, res) => {
  const { specialty } = req.params;
  if (!isAgentSpecialtyId(specialty)) {
    res.status(400).json({ error: "Invalid specialty." });
    return;
  }
  res.json({
    specialty,
    label: SPECIALTY_LABELS[specialty],
    ...getSpecialtyPrompts(specialty),
    systemPromptLength: getSpecialtySystemPrompt(specialty).length,
  });
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

apiRouter.get("/session", async (req, res) => {
  const specialtyParam =
    typeof req.query.specialty === "string" ? req.query.specialty.trim() : "";
  const agentIdParam =
    typeof req.query.agentId === "string" ? req.query.agentId.trim() : "";

  if (!specialtyParam || !isAgentSpecialtyId(specialtyParam)) {
    res.status(400).json({
      connected: false,
      error:
        "Missing or invalid specialty. Choose fitness-nutrition, physical-injuries, mental-health, or symptom-guidance.",
    });
    return;
  }

  if (!agentIdParam) {
    res.status(400).json({
      connected: false,
      error: "Missing agentId. Select an agent before starting a session.",
    });
    return;
  }

  if (!isCatalogAgentId(agentIdParam)) {
    res.status(400).json({
      connected: false,
      error:
        "Invalid agent. Choose nelly, yuruo, alan, or jerome.",
    });
    return;
  }

  const beyAgentId = resolveCatalogAgentBeyId(agentIdParam);
  if (!beyAgentId) {
    res.status(400).json({
      connected: false,
      error: `Agent "${agentIdParam}" is not configured on the server.`,
    });
    return;
  }

  try {
    const config = getConfig();
    const apiKey = assertApiKey(config);
    await verifyApiKey(apiKey);
    const { agent, embedUrl, specialty, agentId } = await resolveSpecialtySession(
      apiKey,
      specialtyParam,
      beyAgentId,
    );

    res.json({
      connected: true,
      specialty,
      agentId,
      catalogAgentId: agentIdParam,
      agent: {
        id: agent.id,
        name: agent.name,
        greeting: agent.greeting ?? null,
        language: agent.language ?? "en-US",
      },
      embedUrl,
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
