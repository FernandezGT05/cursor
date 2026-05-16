import { config } from "../config.js";
import {
  BeyApiError,
  createAgent,
  embedUrl,
  listAgents,
  listAvatars,
  retrieveAgent,
} from "../bey/client.js";
import type { Agent } from "../bey/types.js";
import { MEDICAL_GREETING, MEDICAL_SYSTEM_PROMPT } from "./medicalAgent.js";

export interface ResolvedSession {
  agent: Agent;
  embedUrl: string;
  provisioned: boolean;
}

async function pickAvatarId(apiKey: string): Promise<string> {
  if (config.beyAvatarId) {
    return config.beyAvatarId;
  }

  const avatars = await listAvatars(apiKey);
  const available = avatars.find((a) => a.status === "available");
  if (!available) {
    throw new Error(
      "No available avatar found. Set BEY_AVATAR_ID in .env or create an avatar in the Beyond Presence dashboard.",
    );
  }
  return available.id;
}

async function provisionMedicalAgent(apiKey: string): Promise<Agent> {
  const avatarId = await pickAvatarId(apiKey);
  return createAgent(apiKey, {
    name: config.agentName,
    avatar_id: avatarId,
    system_prompt: MEDICAL_SYSTEM_PROMPT,
    language: "en-US",
    greeting: MEDICAL_GREETING,
    max_session_length_minutes: 30,
  });
}

function normalizeAgentName(name: string): string {
  return name.toLowerCase().replace(/[—–-]/g, "-").trim();
}

function findExistingAgent(agents: Agent[]): Agent | undefined {
  if (config.beyAgentId) {
    return agents.find((a) => a.id === config.beyAgentId);
  }

  const target = normalizeAgentName(config.agentName);
  const byName = agents.find((a) => {
    const n = normalizeAgentName(a.name);
    return (
      n === target ||
      n.includes("dr-vita") ||
      n.includes("dr.vita") ||
      n.includes("vita")
    );
  });
  if (byName) return byName;

  return agents[0];
}

export async function resolveSessionAgent(
  apiKey: string,
): Promise<ResolvedSession> {
  let provisioned = false;
  let agent: Agent | undefined;

  if (config.beyAgentId) {
    try {
      agent = await retrieveAgent(apiKey, config.beyAgentId);
    } catch (error) {
      if (error instanceof BeyApiError && error.status === 404) {
        throw new Error(
          `Agent ${config.beyAgentId} not found. Check BEY_AGENT_ID in .env.`,
        );
      }
      throw error;
    }
  } else {
    const agents = await listAgents(apiKey);
    agent = findExistingAgent(agents);

    if (!agent && config.autoProvisionAgent) {
      agent = await provisionMedicalAgent(apiKey);
      provisioned = true;
    }

    if (!agent) {
      throw new Error(
        "No agents found. Create one in app.bey.chat or set AUTO_PROVISION_AGENT=true with an available avatar.",
      );
    }
  }

  return {
    agent,
    embedUrl: embedUrl(agent.id),
    provisioned,
  };
}
