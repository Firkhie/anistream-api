import express from "express";
import { getAnimeListByPreset, getAnimeDetailById, getAnimeCharactersById, getAnimeDetailByRandom } from "../providers/anilist/anilist.service";

const anilist = express.Router();

anilist.get("/", async (req, res) => {
  console.log("get anilist api..")
  res.json({ message: "Anilist OK" });
});

anilist.get("/popular", async (req, res) => {
  console.log("get anilist popular api..")
  const page = Number(req.query.page) || 1;
  const perPage = Number(req.query.perPage) || 20;
  try {
    const data = await getAnimeListByPreset({ preset: "popular", page, perPage })
    res.status(200).json(data);
  } catch (error) {
    res.status(400).json({ status: "error", message: (error as Error).message });
  }
})

anilist.get("/trending", async (req, res) => {
  console.log("get anilist trending api..")
  const page = Number(req.query.page) || 1;
  const perPage = Number(req.query.perPage) || 20;
  try {
    const data = await getAnimeListByPreset({ preset: "trending", page, perPage })
    res.status(200).json(data);
  } catch (error) {
    res.status(400).json({ status: "error", message: (error as Error).message });
  }
})

anilist.get("/newest", async (req, res) => {
  console.log("get anilist newest api..")
  const page = Number(req.query.page) || 1;
  const perPage = Number(req.query.perPage) || 20;
  try {
    const data = await getAnimeListByPreset({ preset: "newest", page, perPage })
    res.status(200).json(data);
  } catch (error) {
    res.status(400).json({ status: "error", message: (error as Error).message });
  }
})

anilist.get("/upcoming", async (req, res) => {
  console.log("get anilist upcoming api..")
  const page = Number(req.query.page) || 1;
  const perPage = Number(req.query.perPage) || 20;
  try {
    const data = await getAnimeListByPreset({ preset: "upcoming", page, perPage })
    res.status(200).json(data);
  } catch (error) {
    res.status(400).json({ status: "error", message: (error as Error).message });
  }
})

anilist.get("/random", async (req, res) => {
  console.log("get anilist random api..")
  try {
    const data = await getAnimeDetailByRandom()
    res.status(200).json(data);
  } catch (error) {
    res.status(400).json({ status: "error", message: (error as Error).message });
  }
});

anilist.get("/detail/:id", async (req, res) => {
  console.log("get anilist detail api..")
  const { id } = req.params
  try {
    const data = await getAnimeDetailById({ id })
    res.status(200).json(data);
  } catch (error) {
    res.status(400).json({ status: "error", message: (error as Error).message });
  }
});

anilist.get("/detail/:id/characters", async (req, res) => {
  console.log("get anilist detail characters api..")
  const { id } = req.params
  const page = Number(req.query.page) || 1;
  const perPage = Number(req.query.perPage) || 20;
  try {
    const data = await getAnimeCharactersById({ id, page, perPage })
    res.status(200).json(data);
  } catch (error) {
    res.status(400).json({ status: "error", message: (error as Error).message });
  }
});

export default anilist;
