import app from "./app.js";
import { env } from "./env.js";
import { redis } from "./redis.js";

const port = env.PORT;

// Serverless platforms (Vercel) and the test runner manage the HTTP lifecycle
// themselves; everywhere else (dev AND production) we must bind a port.
const shouldListen = env.NODE_ENV !== "test" && !env.VERCEL;

if (shouldListen) {
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
}
