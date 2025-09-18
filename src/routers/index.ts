import express from "express";
import anime from "./anime.js";

const router = express.Router();

router.use("/anime", anime);

export default router;