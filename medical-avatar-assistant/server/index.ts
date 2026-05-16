import cors from "cors";
import fs from "fs";
import express from "express";
import { envPath, getConfig, reloadEnv } from "./config.js";
import { apiRouter } from "./routes/api.js";

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

function logAgentConfig(): void {
  const config = getConfig();
  console.log(`Loaded env from ${config.envPath}`);
  if (config.beyAgentId) {
    console.log(`Using Beyond Presence agent: ${config.beyAgentId}`);
  } else {
    console.log("BEY_AGENT_ID not set — will resolve agent automatically");
  }
  if (!config.beyApiKey) {
    console.warn("Warning: BEY_API_KEY is not set. Add it to .env to connect.");
  }
}

app.listen(bootConfig.port, () => {
  console.log(`API server listening on http://localhost:${bootConfig.port}`);
  logAgentConfig();
});

if (fs.existsSync(envPath)) {
  fs.watch(envPath, (eventType) => {
    if (eventType === "change") {
      reloadEnv();
      console.log(".env changed — reloaded configuration");
      logAgentConfig();
    }
  });
}
