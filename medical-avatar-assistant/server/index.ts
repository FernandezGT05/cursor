import cors from "cors";
import express from "express";
import { config } from "./config.js";
import { apiRouter } from "./routes/api.js";

const app = express();

app.use(
  cors({
    origin: [config.clientOrigin, "http://127.0.0.1:5173"],
    methods: ["GET", "POST", "OPTIONS"],
  }),
);
app.use(express.json());

app.use("/api", apiRouter);

app.listen(config.port, () => {
  console.log(`API server listening on http://localhost:${config.port}`);
  if (!config.beyApiKey) {
    console.warn("Warning: BEY_API_KEY is not set. Add it to .env to connect.");
  }
});
