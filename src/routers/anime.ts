import express from "express";
import { getAnilistByPreset, getAnilistDetailById, getAnilistCharactersById, getAnilistDetailByRandom, getAnilistBySearch, getAnilistAiringSchedule } from "../providers/anilist/anilist.service";
import { MediaVariables } from "../providers/anilist/anilist.types";
import { GenreCollection, MediaFormat, MediaSeason, MediaSort, MediaStatus } from "../providers/anilist/anilist.enums";
import { cleanQueries } from "../utils/helper";
import { getHianimeServersByEpisodeId, getHianimeSource } from "../providers/hianime/hianime.service";
import { episodeMapper, Provider } from "../mappers/anime.mapper";

const anime = express.Router();

anime.get("/popular", async (req, res) => {
  console.log("get anime popular api..")
  const page = Number(req.query.page) || 1;
  const perPage = Number(req.query.perPage) || 20;
  try {
    const data = await getAnilistByPreset({ preset: "popular", page, perPage })
    res.status(200).json(data);
  } catch (error) {
    res.status(400).json({ status: "error", message: (error as Error).message });
  }
})

anime.get("/trending", async (req, res) => {
  console.log("get anime trending api..")
  const page = Number(req.query.page) || 1;
  const perPage = Number(req.query.perPage) || 20;
  try {
    const data = await getAnilistByPreset({ preset: "trending", page, perPage })
    res.status(200).json(data);
  } catch (error) {
    res.status(400).json({ status: "error", message: (error as Error).message });
  }
})

anime.get("/newest", async (req, res) => {
  console.log("get anime newest api..")
  const page = Number(req.query.page) || 1;
  const perPage = Number(req.query.perPage) || 20;
  try {
    const data = await getAnilistByPreset({ preset: "newest", page, perPage })
    res.status(200).json(data);
  } catch (error) {
    res.status(400).json({ status: "error", message: (error as Error).message });
  }
})

anime.get("/upcoming", async (req, res) => {
  console.log("get anime upcoming api..")
  const page = Number(req.query.page) || 1;
  const perPage = Number(req.query.perPage) || 20;
  try {
    const data = await getAnilistByPreset({ preset: "upcoming", page, perPage })
    res.status(200).json(data);
  } catch (error) {
    res.status(400).json({ status: "error", message: (error as Error).message });
  }
})

anime.get("/search", async (req, res) => {
  console.log("get anime search api..")
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
    const data = await getAnilistBySearch({ variables: cleanedQueries as MediaVariables })
    res.status(200).json(data);
  } catch (error) {
    res.status(400).json({ status: "error", message: (error as Error).message });
  }
})

anime.get("/airing", async (req, res) => {
  console.log("get anime airing api..")
  const days = Number(req.query.days) || 7;
  const page = Number(req.query.page) || 1;
  const perPage = Number(req.query.perPage) || 20;
  try {
    const data = await getAnilistAiringSchedule({ days, page, perPage })
    res.status(200).json(data);
  } catch (error) {
    res.status(400).json({ status: "error", message: (error as Error).message });
  }
})

anime.get("/random", async (req, res) => {
  console.log("get anime random api..")
  try {
    const data = await getAnilistDetailByRandom()
    res.status(200).json(data);
  } catch (error) {
    res.status(400).json({ status: "error", message: (error as Error).message });
  }
});

anime.get("/detail/:id", async (req, res) => {
  console.log("get anime detail api..")
  const { id } = req.params
  try {
    const data = await getAnilistDetailById({ id })
    res.status(200).json(data);
  } catch (error) {
    res.status(400).json({ status: "error", message: (error as Error).message });
  }
});

anime.get("/detail/:id/characters", async (req, res) => {
  console.log("get anime detail characters api..")
  const { id } = req.params
  const page = Number(req.query.page) || 1;
  const perPage = Number(req.query.perPage) || 20;
  try {
    const data = await getAnilistCharactersById({ id, page, perPage })
    res.status(200).json(data);
  } catch (error) {
    res.status(400).json({ status: "error", message: (error as Error).message });
  }
});

anime.get("/episodes/:id", async (req, res) => {
  console.log("get episodes api..")
  const { id } = req.params;
  const provider: Provider = String(req.query.provider) as Provider || "hianime";
  try {
    const data = await episodeMapper({ id, provider })
    res.status(200).json(data);
  } catch (error) {
    res.status(400).json({ status: "error", message: (error as Error).message });
  }
})

anime.get("/servers/:episodeId", async (req, res) => {
  console.log("get episode servers api..")
  const { episodeId } = req.params;
  try {
    const data = await getHianimeServersByEpisodeId({ id: episodeId })
    res.status(200).json(data);
  } catch (error) {
    res.status(400).json({ status: "error", message: (error as Error).message });
  }
})

anime.get("/stream", async (req, res) => {
  console.log("get stream api..")
  const episodeId = String(req.query.episodeId);
  const server = String(req.query.server);
  const type = String(req.query.type) as "sub" | "dub";
  try {
    const data = await getHianimeSource({ episodeId, server, type })
    res.status(200).json(data);
  } catch (error) {
    res.status(400).json({ status: "error", message: (error as Error).message });
  }
})

export default anime;
