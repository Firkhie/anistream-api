import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { rateLimit } from 'express-rate-limit'

import routers from "./routers/index.js";
import * as middlewares from "./middlewares.js";

const app = express();
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",").map(origin => origin.trim());
const limiter = rateLimit({
	windowMs: 60 * 1000,
	limit: 60,
	standardHeaders: 'draft-8',
	legacyHeaders: false,
	ipv6Subnet: 56,
})

app.use(morgan("dev"));
app.use(helmet());

app.use(cors({
  origin: function (origin, callback) {
    if (
      !origin ||
      allowedOrigins?.includes("*") ||
      allowedOrigins?.includes(origin)
    ) {
      callback(null, true)
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET"],
}));

app.use(express.json());
app.use(limiter)

app.get("/", (req, res) => {
  res.json({ message: "Hello World" });
});

app.use(routers);

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

export default app;
