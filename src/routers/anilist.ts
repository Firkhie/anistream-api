import express from "express";
import { getAnimeListByPreset, getAnimeDetailById, getAnimeCharactersById, getAnimeDetailByRandom, getAnimeListBySearch } from "../providers/anilist/anilist.service";
import { MediaVariables } from "../providers/anilist/anilist.types";
import { GenreCollection, MediaFormat, MediaSeason, MediaSort, MediaStatus, MediaType } from "../providers/anilist/anilist.enums";
import { cleanQueries } from "../utils/helper";

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

anilist.get("/search", async (req, res) => {
  console.log("get anilist search api..")
  const queries: MediaVariables = {
    page: Number(req.query.page) || 1,
    perPage: Number(req.query.perPage) || 20,
    season: req.query.season ? req.query.season as MediaSeason : undefined,
    seasonYear: req.query.seasonYear ? Number(req.query.seasonYear) : undefined,
    format: req.query.format ? req.query.format as MediaFormat : undefined,
    status: req.query.status ? req.query.status as MediaStatus : undefined,
    isAdult: Boolean(req.query.isAdult),
    search: req.query.search ? String(req.query.search) : undefined,
    averageScoreGreater: req.query.averageScoreGreater ? Number(req.query.averageScoreGreater) : undefined,
    averageScoreLesser: req.query.averageScoreLesser ? Number(req.query.averageScoreLesser) : undefined,
    genreIn: req.query.genreIn ? String(req.query.genreIn).split(',') as GenreCollection[] : undefined,
    sort: req.query.sort ? String(req.query.sort).split(',') as MediaSort[] : undefined,
  }
  const cleanedQueries = cleanQueries({ queries });
  try {
    const data = await getAnimeListBySearch({ variables: cleanedQueries as MediaVariables })
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
