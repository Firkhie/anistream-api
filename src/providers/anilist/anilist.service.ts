import type { AnimeBasic, AnimeDetail, Character, MediaVariables, SearchResponse, Staff } from "./anilist.types.js";

import { getOrSetCache } from "../../redis.js";
import { BadRequestError } from "../../utils/errors.js";
import { getSeason } from "../../utils/helper.js";
import { GenreCollection, MediaFormat, MediaSeason, MediaSort, MediaStatus, MediaType, StaffLanguageV2 } from "./anilist.enums.js";
import { fetchAnilist, fetchAnilistIds } from "./anilist.fetch.js";
import { anilistAiringQuery, anilistCharacterQuery, anilistDetailQuery, anilistSearchQuery, anilistStreamingEpisodesQuery, anilistTitleQuery } from "./anilist.queries.js";

const animeFormat: MediaFormat[] = [
  MediaFormat.TV,
  MediaFormat.TV_SHORT,
  MediaFormat.MOVIE,
  MediaFormat.SPECIAL,
  MediaFormat.OVA,
  MediaFormat.ONA,
];
const langFormat: StaffLanguageV2[] = [
  StaffLanguageV2.JAPANESE,
  StaffLanguageV2.ENGLISH,
  StaffLanguageV2.INDONESIAN,
];

const CACHE_VERSION = "v4";

type PresetName = "popular" | "trending" | "newest" | "upcoming";
const animePreset: Record<PresetName, Partial<MediaVariables>> = {
  popular: {
    type: MediaType.ANIME,
    sort: [MediaSort.POPULARITY_DESC],
    formatIn: animeFormat,
  },
  trending: {
    type: MediaType.ANIME,
    sort: [MediaSort.TRENDING_DESC],
    formatIn: animeFormat,
    status: MediaStatus.RELEASING,
  },
  newest: {
    type: MediaType.ANIME,
    sort: [MediaSort.START_DATE_DESC],
    formatIn: animeFormat,
    status: MediaStatus.RELEASING,
  },
  upcoming: {
    type: MediaType.ANIME,
    sort: [MediaSort.POPULARITY_DESC],
    formatIn: animeFormat,
    status: MediaStatus.NOT_YET_RELEASED,
  },
};

export async function getAnilistByPreset({ preset, page, perPage }: { preset: PresetName; page: number; perPage: number }) {
  const variables = { ...animePreset[preset], page, perPage };
  const cacheKey = `anilist:${CACHE_VERSION}:${preset}:p${page}:pp${perPage}`;
  const ttlSeconds = (preset === "newest" || preset === "trending") ? 60 * 60 * 2 : 60 * 60 * 12;

  return getOrSetCache(cacheKey, async () => {
    const data = (await fetchAnilist({ query: anilistSearchQuery, variables })).data.Page;

    const animeBasics: AnimeBasic[] = data.media.map((item: any) => {
      const animeBasic: AnimeBasic = {
        id: item.id,
        idMal: item.idMal ?? null,
        title: {
          romaji: item.title?.romaji ?? null,
          english: item.title?.english ?? null,
          native: item.title?.native ?? null,
          userPreferred: item.title?.userPreferred ?? null,
        },
        format: item.format ?? null,
        status: item.status ?? null,
        description: item.description ?? null,
        season: item.season ?? null,
        year: item.seasonYear ?? null,
        totalEpisodes: item.episodes ?? null,
        currentEpisode: item.nextAiringEpisode
          ? (item.nextAiringEpisode.episode ?? 1) - 1
          : item.episodes ?? null,
        color: item.coverImage?.color ?? null,
        coverImage:
          item.coverImage?.extraLarge
          ?? item.coverImage?.large
          ?? item.coverImage?.medium
          ?? null,
        bannerImage: item.bannerImage ?? null,
        genres: item.genres ?? [],
        rating: item.averageScore ?? null,
        nextAiringEpisode: item.nextAiringEpisode
          ? {
              airingAt: item.nextAiringEpisode.airingAt ?? null,
              episode: item.nextAiringEpisode.episode ?? null,
              timeUntilAiring: item.nextAiringEpisode.timeUntilAiring ?? null,
            }
          : null,
      };

      return animeBasic;
    }) ?? [];

    const result: SearchResponse = {
      currentPage: data.pageInfo?.currentPage ?? null,
      hasNextPage: data.pageInfo?.hasNextPage ?? null,
      results: animeBasics,
    };

    return result;
  }, ttlSeconds);
}

export async function getAnilistBySearch({ variables }: { variables: MediaVariables }) {
  if (variables.season && !Object.values(MediaSeason).includes(variables.season)) {
    throw new BadRequestError(`Invalid season: ${variables.season}`);
  }
  if (variables.format && !Object.values(MediaFormat).includes(variables.format)) {
    throw new BadRequestError(`Invalid format: ${variables.format}`);
  }
  if (variables.status && !Object.values(MediaStatus).includes(variables.status)) {
    throw new BadRequestError(`Invalid status: ${variables.status}`);
  }
  if (variables.averageScoreGreater && (variables.averageScoreGreater > 100 || variables.averageScoreGreater < 0)) {
    throw new BadRequestError(`Invalid score, must be between 0 - 100`);
  }
  if (variables.averageScoreLesser && (variables.averageScoreLesser > 100 || variables.averageScoreLesser < 0)) {
    throw new BadRequestError(`Invalid score, must be between 0 - 100`);
  }
  if (variables.genreIn) {
    const invalid = variables.genreIn.filter(item => !Object.values(GenreCollection).includes(item));
    if (invalid.length > 0) {
      throw new BadRequestError(`Invalid genres: ${invalid.join(", ")}`);
    }
  }
  if (variables.sort) {
    const invalid = variables.sort.filter(item => !Object.values(MediaSort).includes(item));
    if (invalid.length > 0) {
      throw new BadRequestError(`Invalid sort: ${invalid.join(", ")}`);
    }
  }
  const cacheKey = `anilist:${CACHE_VERSION}:search:${JSON.stringify(variables)}`;
  const ttlSeconds = 60 * 30; // 30 minutes cache for search results

  return getOrSetCache(cacheKey, async () => {
    const searchVariables: MediaVariables = {
      ...variables,
      type: MediaType.ANIME,
      formatIn: variables.format ? undefined : (variables.formatIn?.length ? variables.formatIn : animeFormat),
    };
    const raw = await fetchAnilist({ query: anilistSearchQuery, variables: searchVariables });
    const data = raw?.data?.Page;

    if (!data) {
      return {
        currentPage: variables.page ?? 1,
        hasNextPage: false,
        results: [],
      };
    }

    const mediaList = Array.isArray(data.media) ? data.media : [];

    const animeBasics: AnimeBasic[] = mediaList.map((item: any) => {
    const animeBasic: AnimeBasic = {
      id: item.id,
      idMal: item.idMal ?? null,
      title: {
        romaji: item.title?.romaji ?? null,
        english: item.title?.english ?? null,
        native: item.title?.native ?? null,
        userPreferred: item.title?.userPreferred ?? null,
      },
      format: item.format ?? null,
      status: item.status ?? null,
      description: item.description ?? null,
      season: item.season ?? null,
      year: item.seasonYear ?? null,
      totalEpisodes: item.episodes ?? null,
      currentEpisode: item.nextAiringEpisode
        ? (item.nextAiringEpisode.episode ?? 1) - 1
        : item.episodes ?? null,
      color: item.coverImage?.color ?? null,
      coverImage:
        item.coverImage?.extraLarge
        ?? item.coverImage?.large
        ?? item.coverImage?.medium
        ?? null,
      bannerImage: item.bannerImage ?? null,
      genres: item.genres ?? [],
      rating: item.averageScore ?? null,
      nextAiringEpisode: item.nextAiringEpisode
        ? {
            airingAt: item.nextAiringEpisode.airingAt ?? null,
            episode: item.nextAiringEpisode.episode ?? null,
            timeUntilAiring: item.nextAiringEpisode.timeUntilAiring ?? null,
          }
        : null,
    };

    return animeBasic;
  }) ?? [];

  const result: SearchResponse = {
    currentPage: data.pageInfo?.currentPage ?? null,
    hasNextPage: data.pageInfo?.hasNextPage ?? null,
    results: animeBasics,
  };

  return result;
  }, ttlSeconds);
}

export async function getAnilistAiringSchedule({ days, page, perPage }: { days: number; page: number; perPage: number }) {
  const now = Math.floor(Date.now() / 1000);
  const startOfDay = Math.floor(new Date().setHours(0, 0, 0, 0) / 1000);
  const until = startOfDay + days * 24 * 60 * 60;
  const bucket = Math.floor(now / 3600);
  const cacheKey = `anilist:${CACHE_VERSION}:airing:d${days}:p${page}:pp${perPage}:b${bucket}`;

  return getOrSetCache(cacheKey, async () => {
    const variables = { airingAtLesser: until, airingAtGreater: startOfDay, page, perPage };
    const data = (await fetchAnilist({ query: anilistAiringQuery, variables })).data.Page;

    const animeBasics: AnimeBasic[] = data.airingSchedules.map((item: any) => {
      if (!animeFormat.includes(item.media.format))
        return null;

      const animeBasic: AnimeBasic = {
        id: item.media.id,
        idMal: item.media.idMal ?? null,
        title: {
          romaji: item.media.title?.romaji ?? null,
          english: item.media.title?.english ?? null,
          native: item.media.title?.native ?? null,
          userPreferred: item.media.title?.userPreferred ?? null,
        },
        format: item.media.format ?? null,
        status: item.media.status ?? null,
        description: item.media.description ?? null,
        season: item.media.season ?? null,
        year: item.media.seasonYear ?? null,
        totalEpisodes: item.media.episodes ?? null,
        currentEpisode: item.media.nextAiringEpisode
          ? (item.media.nextAiringEpisode.episode ?? 1) - 1
          : item.media.episodes ?? null,
        color: item.media.coverImage?.color ?? null,
        coverImage:
        item.media.coverImage?.extraLarge
        ?? item.media.coverImage?.large
        ?? item.media.coverImage?.medium
        ?? null,
        bannerImage: item.media.bannerImage ?? null,
        genres: item.media.genres ?? [],
        rating: item.media.averageScore ?? null,
        nextAiringEpisode: {
          airingAt: item.airingAt ?? item.media.nextAiringEpisode?.airingAt ?? null,
          episode: item.episode ?? item.media.nextAiringEpisode?.episode ?? null,
          timeUntilAiring: item.timeUntilAiring ?? item.media.nextAiringEpisode?.timeUntilAiring ?? null,
        },
      };

      return animeBasic;
    })
      .filter(Boolean) ?? [];

    const result: SearchResponse = {
      currentPage: data.pageInfo?.currentPage ?? page,
      hasNextPage: data.pageInfo?.hasNextPage ?? false,
      results: animeBasics,
    };
    return result;
  }, 3600);
}

export async function getAnilistDetailByRandom() {
  const data = await fetchAnilistIds();

  const ids = data?.trim().split("\n");
  const randomize = Math.floor(Math.random() * ids.length);
  const selectedAnime = String(ids[randomize]);

  return await getAnilistDetailById({ id: selectedAnime });
}

export async function getAnilistDetailById({ id }: { id: string }) {
  const cacheKey = `anilist:${CACHE_VERSION}:detail:${id}`;

  return getOrSetCache(cacheKey, async () => {
    const variables = { id };
    const data = (await fetchAnilist({ query: anilistDetailQuery, variables })).data.Media;

    const animeDetail: AnimeDetail = {
      id,
      idMal: data.idMal ?? null,
      title: {
        romaji: data.title?.romaji ?? null,
        english: data.title?.english ?? null,
        native: data.title?.native ?? null,
        userPreferred: data.title?.userPreferred ?? null,
      },
      format: data.format ?? null,
      status: data.status ?? null,
      description: data.description ?? null,
      startDate: {
        year: data.startDate?.year ?? null,
        month: data.startDate?.month ?? null,
        day: data.startDate?.day ?? null,
      },
      endDate: {
        year: data.endDate?.year ?? null,
        month: data.endDate?.month ?? null,
        day: data.endDate?.day ?? null,
      },
      season: data.season ?? null,
      year: data.seasonYear ?? null,
      totalEpisodes: data.episodes ?? null,
      currentEpisode: data.nextAiringEpisode
        ? (data.nextAiringEpisode.episode ?? 1) - 1
        : data.episodes ?? null,
      duration: data.duration ?? null,
      countryOfOrigin: data.countryOfOrigin ?? null,
      isLicensed: data.isLicensed ?? false,
      trailer: data.trailer
        ? {
            id: data.trailer.id ?? null,
            site: data.trailer.site ?? null,
            thumbnail: data.trailer.thumbnail ?? null,
          }
        : null,
      color: data.coverImage?.color ?? null,
      coverImage:
      data.coverImage?.extraLarge
      ?? data.coverImage?.large
      ?? data.coverImage?.medium
      ?? null,
      bannerImage: data.bannerImage ?? null,
      genres: data.genres ?? [],
      synonyms: data.synonyms ?? [],
      rating: data.averageScore ?? null,
      popularity: data.popularity ?? null,
      isAdult: data.isAdult ?? false,
      source: data.source ?? null,
      nextAiringEpisode: data.nextAiringEpisode
        ? {
            airingAt: data.nextAiringEpisode.airingAt ?? null,
            episode: data.nextAiringEpisode.episode ?? null,
            timeUntilAiring: data.nextAiringEpisode.timeUntilAiring ?? null,
          }
        : null,
      studios: data.studios?.edges?.map((item: any) => item.node.name) ?? [],
      relations:
      data.relations?.edges
        ?.map((item: any) => {
          if (item.node.type !== "ANIME")
            return null;
          if (!animeFormat.includes(item.node.format))
            return null;

          return {
            id: item.node.id,
            idMal: item.node.idMal ?? null,
            title: {
              romaji: item.node.title?.romaji ?? null,
              english: item.node.title?.english ?? null,
              native: item.node.title?.native ?? null,
              userPreferred: item.node.title?.userPreferred ?? null,
            },
            format: item.node.format,
            status: item.node.status ?? null,
            description: item.node.description ?? null,
            season: item.node.season ?? null,
            year: item.node.seasonYear ?? null,
            totalEpisodes: item.node.episodes ?? null,
            currentEpisode: item.node.nextAiringEpisode
              ? (item.node.nextAiringEpisode.episode ?? 1) - 1
              : item.node.episodes ?? null,
            color: item.node.coverImage?.color ?? null,
            coverImage:
              item.node.coverImage?.extraLarge
              ?? item.node.coverImage?.large
              ?? item.node.coverImage?.medium
              ?? null,
            bannerImage: item.node.bannerImage ?? null,
            genres: item.node.genres ?? [],
            rating: item.node.averageScore ?? null,
            relationType: item.relationType,
            nextAiringEpisode: item.node.nextAiringEpisode
              ? {
                  airingAt: item.node.nextAiringEpisode.airingAt ?? null,
                  episode: item.node.nextAiringEpisode.episode ?? null,
                  timeUntilAiring:
                    item.node.nextAiringEpisode.timeUntilAiring ?? null,
                }
              : null,
          };
        })
        .filter(Boolean) ?? [],
      characters:
      data.characters?.edges?.map((item: any) => ({
        id: item.node.id,
        role: item.role ?? null,
        name: {
          first: item.node.name?.first ?? null,
          last: item.node.name?.last ?? null,
          full: item.node.name?.full ?? null,
          userPreferred: item.node.name?.userPreferred ?? null,
        },
        image: item.node.image?.large ?? item.node.image?.medium ?? null,
        voiceActors:
          item.voiceActors?.map((actor: any) => ({
            id: actor.id,
            name: {
              first: actor.name?.first ?? null,
              last: actor.name?.last ?? null,
              full: actor.name?.full ?? null,
              userPreferred: actor.name?.userPreferred ?? null,
            },
            language: actor.languageV2 ?? null,
            image: actor.image?.large ?? actor.image?.medium ?? null,
          })) ?? [],
      })) ?? [],
      recommendations:
      data.recommendations?.edges
        ?.map((item: any) => {
          const rec = item.node.mediaRecommendation;
          if (rec.type !== "ANIME")
            return null;
          if (!animeFormat.includes(rec.format))
            return null;

          return {
            id: rec.id,
            idMal: rec.idMal ?? null,
            title: {
              romaji: rec.title?.romaji ?? null,
              english: rec.title?.english ?? null,
              native: rec.title?.native ?? null,
              userPreferred: rec.title?.userPreferred ?? null,
            },
            format: rec.format,
            status: rec.status ?? null,
            description: rec.description ?? null,
            season: rec.season ?? null,
            year: rec.seasonYear ?? null,
            totalEpisodes: rec.episodes ?? null,
            currentEpisode: rec.nextAiringEpisode
              ? (rec.nextAiringEpisode.episode ?? 1) - 1
              : rec.episodes ?? null,
            color: rec.coverImage?.color ?? null,
            coverImage:
              rec.coverImage?.extraLarge ?? rec.coverImage?.large ?? rec.coverImage?.medium ?? null,
            bannerImage: rec.bannerImage ?? null,
            genres: rec.genres ?? [],
            rating: rec.averageScore ?? null,
            nextAiringEpisode: rec.nextAiringEpisode
              ? {
                  airingAt: rec.nextAiringEpisode.airingAt ?? null,
                  episode: rec.nextAiringEpisode.episode ?? null,
                  timeUntilAiring: rec.nextAiringEpisode.timeUntilAiring ?? null,
                }
              : null,
          };
        })
        .filter(Boolean) ?? [],
    };
    return animeDetail;
  }, 86400);
}

export async function getAnilistCharactersById({
  id,
  page,
  perPage,
}: {
  id: string;
  page?: number;
  perPage?: number;
}) {
  const p = page || 1;
  const pp = perPage || 50;
  const cacheKey = `anilist:${CACHE_VERSION}:characters:${id}:p${p}:pp${pp}`;

  return getOrSetCache(cacheKey, async () => {
    const variables = { id, page: p, perPage: pp };
    const data = (await fetchAnilist({ query: anilistCharacterQuery, variables })).data.Media.characters;

    const characters: Character[] = data.edges?.map((item: any) => {
      const character: Character = {
        id: item.node.id,
        role: item.role ?? null,
        name: {
          first: item.node.name?.first ?? null,
          last: item.node.name?.last ?? null,
          full: item.node.name?.full ?? null,
          userPreferred: item.node.name?.userPreferred ?? null,
        },
        image: item.node.image?.large ?? item.node.image?.medium ?? null,
        voiceActors: (item.voiceActors ?? [])
          .map((actor: any) => {
            if (!actor.languageV2)
              return null;
            if (!langFormat.includes(actor.languageV2.toUpperCase()))
              return null;

            return {
              id: actor.id,
              name: {
                first: actor.name?.first ?? null,
                last: actor.name?.last ?? null,
                full: actor.name?.full ?? null,
                userPreferred: actor.name?.userPreferred ?? null,
              },
              language: actor.languageV2 ?? null,
              image: actor.image?.large ?? actor.image?.medium ?? null,
            } as Staff;
          })
          .filter(Boolean),
      };

      return character;
    }) ?? [];

    const result: SearchResponse = {
      currentPage: data.pageInfo?.currentPage ?? p,
      hasNextPage: data.pageInfo?.hasNextPage ?? false,
      results: characters,
    };
    return result;
  }, 259200);
}

export async function getAnilistTitleById({ id }: { id: string }) {
  const variables = { id };
  const data = (await fetchAnilist({ query: anilistTitleQuery, variables })).data.Media;

  return data;
}

export async function getAnilistStreamingEpisodesById({ id }: { id: string }) {
  const cacheKey = `anilist:${CACHE_VERSION}:streaming-episodes:${id}`;

  return getOrSetCache(cacheKey, async () => {
    const variables = { id: Number(id) };
    const data = (await fetchAnilist({ query: anilistStreamingEpisodesQuery, variables })).data.Media;
    return data as {
      id: number;
      status: string | null;
      episodes: number | null;
      nextAiringEpisode?: { episode: number } | null;
      streamingEpisodes?: {
        title: string;
        thumbnail: string;
        url: string;
        site: string;
      }[];
    };
  }, 21600);
}
