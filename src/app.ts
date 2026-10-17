import cors from "cors";
import express from "express";
import { rateLimit } from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";

import { env } from "./env.js";
import * as middlewares from "./middlewares.js";
import { redis } from "./redis.js";
import routers from "./routers/index.js";

const app = express();

// Trust reverse proxies (Vercel, Cloudflare, AWS, Nginx) so req.ip and X-Forwarded-For work correctly
app.set("trust proxy", 1);

const allowedOrigins = env.ALLOWED_ORIGINS
  ? env.ALLOWED_ORIGINS.split(",").map(origin => origin.trim())
  : ["*"];

// Standard in-memory fallback rate limiter
const localLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 60,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  ipv6Subnet: 56,
  validate: {
    forwardedHeader: false,
  },
});

// Distributed rate limiter (uses Upstash Redis across serverless instances if configured)
async function distributedLimiter(req: express.Request, res: express.Response, next: express.NextFunction) {
  if (!redis || env.NODE_ENV === "test") {
    return localLimiter(req, res, next);
  }

  try {
    const ip
      = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim()
        || req.ip
        || "unknown-ip";
    const key = `ratelimit:api:${ip}`;
    const windowSec = 60;
    const maxLimit = 60;

    const count = await redis.incr(key);
    if (count === 1) {
      await redis.expire(key, windowSec);
    }

    res.setHeader("X-RateLimit-Limit", maxLimit);
    res.setHeader("X-RateLimit-Remaining", Math.max(0, maxLimit - count));

    if (count > maxLimit) {
      res.setHeader("Retry-After", windowSec);
      return res.status(429).json({
        message: "Too many requests. Please slow down.",
      });
    }

    return next();
  }
  catch {
    return localLimiter(req, res, next);
  }
}

// Bot & automated scraper blocker for production
const BOT_UA_REGEX
  = /curl|python-requests|aiohttp|scrapy|postmanruntime|go-http-client|httpie|libwww-perl|wget|urllib/i;

function botBlocker(req: express.Request, res: express.Response, next: express.NextFunction) {
  if (req.path === "/health" || req.path === "/") {
    return next();
  }

  if (env.NODE_ENV !== "production") {
    return next();
  }

  const userAgent = req.headers["user-agent"] || "";
  const apiKey = req.headers["x-api-key"];
  const expectedApiKey = env.API_SECRET_KEY;

  if (expectedApiKey && apiKey === expectedApiKey) {
    return next();
  }

  if (!userAgent || BOT_UA_REGEX.test(userAgent)) {
    return res.status(403).json({
      message: "Automated scraping tools and bots are not permitted.",
    });
  }

  next();
}

app.use(morgan("dev"));
app.use(helmet());

app.use(
  cors({
    origin(origin, callback) {
      if (
        !origin
        || allowedOrigins?.includes("*")
        || (origin && allowedOrigins?.includes(origin))
      ) {
        callback(null, true);
      }
      else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET"],
  }),
);

app.use(express.json());
app.use(botBlocker);
app.use(distributedLimiter);

app.get("/", (req, res) => {
  res.json({ message: "Hello World" });
});

app.get("/health", async (req, res) => {
  let redisStatus = "disabled";
  if (redis) {
    try {
      const pingRes = await redis.ping();
      redisStatus = pingRes === "PONG" ? "healthy" : "connected";
    }
    catch {
      redisStatus = "unreachable";
    }
  }

  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    redis: redisStatus,
  });
});

app.use(routers);

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

export default app;
