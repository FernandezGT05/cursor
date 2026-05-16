export interface CatalogAgent {
  id: string;
  displayName: string;
  imageUrl: string;
}

export const AGENT_CATALOG: CatalogAgent[] = [
  {
    id: "nelly",
    displayName: "Nelly",
    imageUrl: "/images/agents/nelly.png",
  },
  {
    id: "yuruo",
    displayName: "Yuruo",
    imageUrl: "/images/agents/yuruo.png",
  },
  {
    id: "alan",
    displayName: "Alan",
    imageUrl: "/images/agents/alan.png",
  },
  {
    id: "jerome",
    displayName: "Jerome",
    imageUrl: "/images/agents/jerome.png",
  },
];

export function getCatalogAgent(catalogId: string): CatalogAgent | undefined {
  return AGENT_CATALOG.find((a) => a.id === catalogId);
}

/** Migrate legacy stored id from before Alan rename. */
export function normalizeCatalogAgentId(stored: string | null): string | null {
  if (!stored) return null;
  if (stored === "ege") return "alan";
  return getCatalogAgent(stored) ? stored : null;
}
