import express from "express";

import type { Provider } from "../mappers/anime.mapper.js";
import type { GenreCollection, MediaFormat, MediaSeason, MediaSort, MediaStatus } from "../providers/anilist/anilist.enums.js";
import type { MediaVariables } from "../providers/anilist/anilist.types.js";
import type { ProviderName } from "../providers/provider.interface.js";

import { episodeMapper } from "../mappers/anime.mapper.js";
import { getAnilistAiringSchedule, getAnilistByPreset, getAnilistBySearch, getAnilistCharactersById, getAnilistDetailById, getAnilistDetailByRandom, getAnilistTitleById } from "../providers/anilist/anilist.service.js";
import { providerManager } from "../providers/provider.manager.js";
import { sendError } from "../utils/errors.js";
import { cleanQueries } from "../utils/helper.js";

const anime = express.Router();

anime.get("/popular", async (req, res) => {
  console.log("get anime popular api..");
  const page = req.query.page ? Number(req.query.page) : 1;
  const perPage = req.query.perPage ? Number(req.query.perPage) : 20;
  try {
    const data = await getAnilistByPreset({ preset: "popular", page, perPage });
    res.status(200).json(data);
  }
  catch (error) {
    sendError(res, error);
  }
});

anime.get("/trending", async (req, res) => {
  console.log("get anime trending api..");
  const page = req.query.page ? Number(req.query.page) : 1;
  const perPage = req.query.perPage ? Number(req.query.perPage) : 20;
  try {
    const data = await getAnilistByPreset({ preset: "trending", page, perPage });
    res.status(200).json(data);
  }
  catch (error) {
    sendError(res, error);
  }
});

anime.get("/newest", async (req, res) => {
  console.log("get anime newest api..");
  const page = req.query.page ? Number(req.query.page) : 1;
  const perPage = req.query.perPage ? Number(req.query.perPage) : 20;
  try {
    const data = await getAnilistByPreset({ preset: "newest", page, perPage });
    res.status(200).json(data);
  }
  catch (error) {
    sendError(res, error);
  }
});

anime.get("/upcoming", async (req, res) => {
  console.log("get anime upcoming api..");
  const page = req.query.page ? Number(req.query.page) : 1;
  const perPage = req.query.perPage ? Number(req.query.perPage) : 20;
  try {
    const data = await getAnilistByPreset({ preset: "upcoming", page, perPage });
    res.status(200).json(data);
  }
  catch (error) {
    sendError(res, error);
  }
});

anime.get("/search", async (req, res) => {
  console.log("get anime search api..");
  const queries: MediaVariables = {
    page: req.query.page ? Number(req.query.page) : 1,
    perPage: req.query.perPage ? Number(req.query.perPage) : 20,
    season: req.query.season ? req.query.season as MediaSeason : undefined,
    seasonYear: req.query.year ? Number(req.query.year) : undefined, // FE Query use 'year'
    format: req.query.format ? req.query.format as MediaFormat : undefined,
    status: req.query.status ? req.query.status as MediaStatus : undefined,
    isAdult: Boolean(req.query.isAdult),
    search: req.query.query ? String(req.query.query) : undefined, // FE Query use 'query'
    averageScoreGreater: req.query.averageScoreGreater ? Number(req.query.averageScoreGreater) : undefined,
    averageScoreLesser: req.query.averageScoreLesser ? Number(req.query.averageScoreLesser) : undefined,
    genreIn: req.query.genres ? String(req.query.genres).split(",") as GenreCollection[] : undefined, // FE Query use 'genres'
    sort: req.query.sort ? String(req.query.sort).split(",") as MediaSort[] : undefined,
  };
  const cleanedQueries = cleanQueries({ queries });
  try {
    const data = await getAnilistBySearch({ variables: cleanedQueries as MediaVariables });
    res.status(200).json(data);
  }
  catch (error) {
    sendError(res, error);
  }
});

anime.get("/airing", async (req, res) => {
  console.log("get anime airing api..");
  const days = req.query.days ? Number(req.query.days) : 7;
  const page = req.query.page ? Number(req.query.page) : 1;
  const perPage = req.query.perPage ? Number(req.query.perPage) : 20;
  try {
    const data = await getAnilistAiringSchedule({ days, page, perPage });
    res.status(200).json(data);
  }
  catch (error) {
    sendError(res, error);
  }
});

anime.get("/random", async (req, res) => {
  console.log("get anime random api..");
  try {
    const data = await getAnilistDetailByRandom();
    res.status(200).json(data);
  }
  catch (error) {
    sendError(res, error);
  }
});

anime.get("/base/:id", async (req, res) => {
  console.log("get anime basic api..");
  const { id } = req.params;
  try {
    const data = await getAnilistTitleById({ id });
    res.status(200).json(data);
  }
  catch (error) {
    sendError(res, error);
  }
});

anime.get("/detail/:id", async (req, res) => {
  console.log("get anime detail api..");
  const { id } = req.params;
  try {
    const data = await getAnilistDetailById({ id });
    res.status(200).json(data);
  }
  catch (error) {
    sendError(res, error);
  }
});

anime.get("/detail/:id/characters", async (req, res) => {
  console.log("get anime detail characters api..");
  const { id } = req.params;
  const page = req.query.page ? Number(req.query.page) : 1;
  const perPage = req.query.perPage ? Number(req.query.perPage) : 50;
  try {
    const data = await getAnilistCharactersById({ id, page, perPage });
    res.status(200).json(data);
  }
  catch (error) {
    sendError(res, error);
  }
});

anime.get("/episodes/:id", async (req, res) => {
  console.log("get episodes api..");
  const { id } = req.params;
  const provider = (req.query.provider ? String(req.query.provider) : "hianime") as Provider;
  try {
    const data = await episodeMapper({ id, provider });
    res.status(200).json(data);
  }
  catch (error) {
    sendError(res, error);
  }
});

anime.get("/servers", async (req, res) => {
  console.log("get episode servers api..");
  const id = req.query.id ? String(req.query.id) : "";
  const providerName = (req.query.provider ? String(req.query.provider) : "hianime") as ProviderName;
  try {
    const provider = providerManager.get(providerName);
    const data = await provider.getServers(id);
    res.status(200).json(data);
  }
  catch (error) {
    sendError(res, error);
  }
});

anime.get("/stream", async (req, res) => {
  console.log("get stream api..");
  const source = (req.query.source ? String(req.query.source) : "hianime") as ProviderName;
  const id = req.query.id ? String(req.query.id) : "";
  const server = req.query.server ? String(req.query.server) : "hd-1";
  const type = req.query.type ? String(req.query.type) as "sub" | "dub" : "sub";
  try {
    const data = await providerManager.getSourceWithFallback({
      source,
      id,
      server,
      type,
    });

    res.status(200).json(data);
  }
  catch (error) {
    sendError(res, error);
  }
});

export default anime;
