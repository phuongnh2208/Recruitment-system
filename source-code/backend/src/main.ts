import express from "express";
import helmet from "helmet";
import cors from "cors";
import pino from "pino";
import pinoHttp from "pino-http";
import * as dotenv from "dotenv";

dotenv.config();

const logger = pino({
  level: process.env.LOG_LEVEL || "info",
});

const app = express();
const port = process.env.PORT || 3000;

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || "*" }));
app.use(express.json());
app.use(pinoHttp({ logger }));

app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.listen(port, () => {
  logger.info(`Server is running on port ${port}`);
});
