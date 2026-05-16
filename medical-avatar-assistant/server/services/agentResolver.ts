import { getConfig } from "../config.js";
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

async function pickAvatarId(apiKey: string, beyAvatarId?: string): Promise<string> {
  if (beyAvatarId) {
    return beyAvatarId;
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

async function provisionMedicalAgent(
  apiKey: string,
  agentName: string,
  beyAvatarId?: string,
): Promise<Agent> {
  const avatarId = await pickAvatarId(apiKey, beyAvatarId);
  return createAgent(apiKey, {
    name: agentName,
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

function findExistingAgent(
  agents: Agent[],
  beyAgentId: string | undefined,
  agentName: string,
): Agent | undefined {
  if (beyAgentId) {
    return agents.find((a) => a.id === beyAgentId);
  }

  const target = normalizeAgentName(agentName);
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

export async function resolveSessionAgent(apiKey: string): Promise<ResolvedSession> {
  const config = getConfig();
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
    agent = findExistingAgent(agents, config.beyAgentId, config.agentName);

    if (!agent && config.autoProvisionAgent) {
      agent = await provisionMedicalAgent(
        apiKey,
        config.agentName,
        config.beyAvatarId,
      );
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
