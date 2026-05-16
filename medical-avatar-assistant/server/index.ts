import cors from "cors";
import fs from "fs";
import express from "express";
import { envPath, getConfig, reloadEnv } from "./config.js";
import { apiRouter } from "./routes/api.js";
import {
  CATALOG_AGENT_IDS,
  CATALOG_AGENT_LABELS,
  resolveCatalogAgentBeyId,
} from "./services/agentCatalog.js";

reloadEnv();
const bootConfig = getConfig();

const app = express();

app.use(
  cors({
    origin: [bootConfig.clientOrigin, "http://127.0.0.1:5173"],
    methods: ["GET", "POST", "OPTIONS"],
  }),
);
app.use(express.json());

app.use("/api", apiRouter);

function logCatalogAgentConfig(): void {
  const config = getConfig();
  console.log(`Loaded env from ${config.envPath}`);
  if (!config.beyApiKey) {
    console.warn("Warning: BEY_API_KEY is not set. Add it to .env to connect.");
  }
  for (const id of CATALOG_AGENT_IDS) {
    const beyId = resolveCatalogAgentBeyId(id);
    const label = CATALOG_AGENT_LABELS[id];
    console.log(
      `  ${label} (${id}): ${beyId ?? "not configured — set BEY_AGENT_ID_${id.toUpperCase()} in .env"}`,
    );
  }
}

app.listen(bootConfig.port, () => {
  console.log(`API server listening on http://localhost:${bootConfig.port}`);
  logCatalogAgentConfig();
});

if (fs.existsSync(envPath)) {
  fs.watch(envPath, (eventType) => {
    if (eventType === "change") {
      reloadEnv();
      console.log(".env changed — reloaded configuration");
      logCatalogAgentConfig();
    }
  });
}
