import app from "./app.js";
import { env } from "./env.js";
import { Redis } from '@upstash/redis'

export const redis = 
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

const port = env.PORT;
const server = app.listen(port, () => {
  console.log(`Listening: http://localhost:${port}`);
  if (!redis) {
    console.log(`Redis not found. Cache disabled.`);
  }
});

server.on("error", (err) => {
  if ("code" in err && err.code === "EADDRINUSE") {
    console.error(`Port ${env.PORT} is already in use. Please choose another port or stop the process using it.`);
  }
  else {
    console.error("Failed to start server:", err);
  }
  process.exit(1);
});
