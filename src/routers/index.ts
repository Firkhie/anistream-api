import express from "express";
import anilist from "./anilist.js";

const router = express.Router();

router.use("/anilist", anilist);

export default router;