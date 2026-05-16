import cors from "cors";
import fs from "fs";
import express from "express";
import { envPath, getConfig, reloadEnv } from "./config.js";
import { closeDb, getDb } from "./db/db.js";
import { runMigrations } from "./db/migrate.js";
import { apiRouter } from "./routes/api.js";
import { authRouter } from "./routes/auth.js";
import { consultationsRouter } from "./routes/consultations.js";
import { historyRouter } from "./routes/history.js";
import { webhooksRouter } from "./routes/webhooks.js";
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
    methods: ["GET", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json({ limit: "2mb" }));

app.use("/api/auth", authRouter);
app.use("/api/history", historyRouter);
app.use("/api/consultations", consultationsRouter);
app.use("/api/webhooks", webhooksRouter);
app.use("/api", apiRouter);

function logCatalogAgentConfig(): void {
  const config = getConfig();
  console.log(`Loaded env from ${config.envPath}`);
  console.log(`SQLite database: ${config.sqlitePath}`);
  if (!config.beyApiKey) {
    console.warn("Warning: BEY_API_KEY is not set. Add it to .env to connect.");
  }
  if (!config.openaiApiKey) {
    console.warn("Warning: OPENAI_API_KEY is not set. Visit summaries will fail.");
  }
  if (!config.jwtSecret) {
    console.warn("Warning: JWT_SECRET is not set. Auth will fail.");
  }
  for (const id of CATALOG_AGENT_IDS) {
    const beyId = resolveCatalogAgentBeyId(id);
    const label = CATALOG_AGENT_LABELS[id];
    console.log(
      `  ${label} (${id}): ${beyId ?? "not configured — set BEY_AGENT_ID_${id.toUpperCase()} in .env"}`,
    );
  }
}

function start(): void {
  getDb();
  runMigrations();
  console.log("Database ready (SQLite).");

  app.listen(bootConfig.port, () => {
    console.log(`API server listening on http://localhost:${bootConfig.port}`);
    logCatalogAgentConfig();
  });
}

if (fs.existsSync(envPath)) {
  fs.watch(envPath, (eventType) => {
    if (eventType === "change") {
      reloadEnv();
      console.log(".env changed — reloaded configuration");
      logCatalogAgentConfig();
    }
  });
}

try {
  start();
} catch (error) {
  console.error("Failed to start server:", error);
  process.exit(1);
}

process.on("SIGTERM", () => {
  closeDb();
});
