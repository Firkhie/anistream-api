import express from "express";
import { fetchAnimeDetailById, fetchAnimeCharactersById, fetchAnimePopular, fetchAnimeTrending } from "../providers/anilist";

const router = express.Router();

router.get("/", async (req, res) => {
  console.log("get anilist api..")
  res.json({ message: "Anilist OK" });
});

router.get("/popular", async (req, res) => {
  console.log("get anilist popular api..")
  const { page } = req.query;
  try {
    const data = await fetchAnimePopular({ page: Number(page) })
    res.status(200).json(data);
  } catch (error) {
    res.status(400).json({ status: "error", message: (error as Error).message });
  }
})

router.get("/trending", async (req, res) => {
  console.log("get anilist trending api..")
  const { page } = req.query;
  try {
    const data = await fetchAnimeTrending({ page: Number(page) })
    res.status(200).json(data);
  } catch (error) {
    res.status(400).json({ status: "error", message: (error as Error).message });
  }
})

router.get("/detail/:id", async (req, res) => {
  console.log("get anilist detail api..")
  const { id } = req.params
  try {
    const data = await fetchAnimeDetailById({ id })
    res.status(200).json(data);
  } catch (error) {
    res.status(400).json({ status: "error", message: (error as Error).message });
  }
});

router.get("/detail/:id/characters", async (req, res) => {
  console.log("get anilist detail characters api..")
  const { id } = req.params
  const { page } = req.query;
  try {
    const data = await fetchAnimeCharactersById({ id, page: Number(page) })
    res.status(200).json(data);
  } catch (error) {
    res.status(400).json({ status: "error", message: (error as Error).message });
  }
});

export default router;
