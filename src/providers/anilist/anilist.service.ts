import { getSeason } from "../../utils/helper";
import { GenreCollection, MediaFormat, MediaSeason, MediaSort, MediaStatus, MediaType, StaffLanguageV2 } from "./anilist.enums";
import { fetchAnilist, fetchAnilistIds } from "./anilist.fetch";
import { anilistAiringQuery, anilistCharacterQuery, anilistDetailQuery, anilistSearchQuery } from "./anilist.queries";
import { AnimeBasic, AnimeDetail, Character, MediaVariables, SearchResponse, Staff } from "./anilist.types";

type PresetName = "popular" | "trending" | "newest" | "upcoming";
const animePreset: Record<PresetName, Partial<MediaVariables>> = {
  popular: {
    type: MediaType.ANIME,
    sort: [MediaSort.POPULARITY_DESC],
    formatIn: [MediaFormat.TV],
    seasonYear: new Date().getFullYear(),
    season: getSeason()
  },
  trending: {
    type: MediaType.ANIME,
    sort: [MediaSort.TRENDING_DESC],
    formatIn: [MediaFormat.TV],
  },
  newest: {
    type: MediaType.ANIME,
    sort: [MediaSort.UPDATED_AT_DESC],
    formatIn: [MediaFormat.TV],
    status: MediaStatus.RELEASING,
  },
  upcoming: {
    type: MediaType.ANIME,
    sort: [MediaSort.TRENDING_DESC],
    formatIn: [MediaFormat.TV],
    status: MediaStatus.NOT_YET_RELEASED,
  }
}
const animeFormat: MediaFormat[] = [
  MediaFormat.TV,
  MediaFormat.TV_SHORT,
  MediaFormat.MOVIE,
  MediaFormat.SPECIAL,
  MediaFormat.OVA,
  MediaFormat.ONA,
]
const langFormat: StaffLanguageV2[] = [
  StaffLanguageV2.JAPANESE,
  StaffLanguageV2.ENGLISH,
  StaffLanguageV2.INDONESIAN,
]

export async function getAnimeListByPreset({ preset, page, perPage }: { preset: PresetName, page: number, perPage: number }) {
  const variables = { ...animePreset[preset], page, perPage }
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
      totalEpisodes: item.episodes ?? null,
      currentEpisodes: item.nextAiringEpisode
        ? (item.nextAiringEpisode.episode ?? 1) - 1
        : item.episodes ?? null,
      color: item.coverImage?.color ?? null,
      coverImage:
        item.coverImage?.extraLarge ??
        item.coverImage?.large ??
        item.coverImage?.medium ??
        null,
      bannerImage: item.bannerImage ?? null,
      rating: item.averageScore ?? null,
      nextAiringEpisode: item.nextAiringEpisode
        ? {
            airingAt: item.nextAiringEpisode.airingAt ?? null,
            episode: item.nextAiringEpisode.episode ?? null,
            timeUntilAiring: item.nextAiringEpisode.timeUntilAiring ?? null,
          }
        : null,
    }

    return animeBasic
  }) ?? []

  const result: SearchResponse = {
    currentPage: data.pageInfo?.currentPage ?? null,
    hasNextPage: data.pageInfo?.hasNextPage ?? null,
    results: animeBasics
  }

  return result;
}

export async function getAnimeListBySearch({ variables }: { variables: MediaVariables }) {
  if (variables.season && !Object.values(MediaSeason).some(s => s === variables.season)) {
    throw new Error(`Invalid season: ${variables.season}`);
  }
  if (variables.format && !Object.values(MediaFormat).some(f => f === variables.format)) {
    throw new Error(`Invalid format: ${variables.format}`);
  }
  if (variables.status && !Object.values(MediaStatus).some(s => s === variables.status)) {
    throw new Error(`Invalid status: ${variables.status}`);
  }
  if (variables.averageScoreGreater && (variables.averageScoreGreater > 100 || variables.averageScoreGreater < 0)) {
    throw new Error(`Invalid score, must be between 0 - 100`);
  }
  if (variables.averageScoreLesser && (variables.averageScoreLesser > 100 || variables.averageScoreLesser < 0)) {
    throw new Error(`Invalid score, must be between 0 - 100`);
  }
  if (variables.genreIn) {
    const invalid = variables.genreIn.filter(item => !Object.values(GenreCollection).includes(item));
    if (invalid.length > 0) {
      throw new Error(`Invalid genres: ${invalid.join(', ')}`);
    }
  }
  if (variables.sort) {
    const invalid = variables.sort.filter(item => !Object.values(MediaSort).includes(item));
    if (invalid.length > 0) {
      throw new Error(`Invalid sort: ${invalid.join(', ')}`);
    }
  }
  const data = (await fetchAnilist({ query: anilistSearchQuery, variables: { ...variables, type: "ANIME" } })).data.Page;

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
      totalEpisodes: item.episodes ?? null,
      currentEpisodes: item.nextAiringEpisode
        ? (item.nextAiringEpisode.episode ?? 1) - 1
        : item.episodes ?? null,
      color: item.coverImage?.color ?? null,
      coverImage:
        item.coverImage?.extraLarge ??
        item.coverImage?.large ??
        item.coverImage?.medium ??
        null,
      bannerImage: item.bannerImage ?? null,
      rating: item.averageScore ?? null,
      nextAiringEpisode: item.nextAiringEpisode
        ? {
            airingAt: item.nextAiringEpisode.airingAt ?? null,
            episode: item.nextAiringEpisode.episode ?? null,
            timeUntilAiring: item.nextAiringEpisode.timeUntilAiring ?? null,
          }
        : null,
    }

    return animeBasic
  }) ?? []

  const result: SearchResponse = {
    currentPage: data.pageInfo?.currentPage ?? null,
    hasNextPage: data.pageInfo?.hasNextPage ?? null,
    results: animeBasics
  }

  return result;
}

export async function getAnimeAiringSchedule({ days, page, perPage }: { days: number, page: number, perPage: number }) {
  const now = Math.floor(Date.now() / 1000); 
  const until = now + days * 24 * 60 * 60;

  const variables = { airingAtLesser: until, airingAtGreater: now, page, perPage }
  const data = (await fetchAnilist({ query: anilistAiringQuery, variables })).data.Page;

  const animeBasics: AnimeBasic[] = data.airingSchedules.map((item: any) => {
    if (!animeFormat.includes(item.media.format)) return null;

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
      totalEpisodes: item.media.episodes ?? null,
      currentEpisodes: item.media.nextAiringEpisode
        ? (item.media.nextAiringEpisode.episode ?? 1) - 1
        : item.media.episodes ?? null,
      color: item.media.coverImage?.color ?? null,
      coverImage:
        item.media.coverImage?.extraLarge ??
        item.media.coverImage?.large ??
        item.media.coverImage?.medium ??
        null,
      bannerImage: item.media.bannerImage ?? null,
      rating: item.media.averageScore ?? null,
      nextAiringEpisode: item.media.nextAiringEpisode
        ? {
            airingAt: item.media.nextAiringEpisode.airingAt ?? null,
            episode: item.media.nextAiringEpisode.episode ?? null,
            timeUntilAiring: item.media.nextAiringEpisode.timeUntilAiring ?? null,
          }
        : null,
    }

    return animeBasic
  })
  .filter(Boolean) ?? []

  const result: SearchResponse = {
    currentPage: data.pageInfo?.currentPage ?? null,
    hasNextPage: data.pageInfo?.hasNextPage ?? null,
    results: animeBasics
  }

  return result;
}

export async function getAnimeDetailByRandom() {
  const data = await fetchAnilistIds();

  const ids = data?.trim().split('\n');
  const randomize = Math.floor(Math.random() * ids.length);
  const selectedAnime = String(ids[randomize])

  return await getAnimeDetailById({ id: selectedAnime })
}

export async function getAnimeDetailById({ id }: { id: string }) {
  const variables = { id }
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
    seasonYear: data.seasonYear ?? null,
    totalEpisodes: data.episodes ?? null,
    currentEpisodes: data.nextAiringEpisode
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
      data.coverImage?.extraLarge ??
      data.coverImage?.large ??
      data.coverImage?.medium ??
      null,
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
          if (item.node.type !== "ANIME") return null;
          if (!animeFormat.includes(item.node.format)) return null;

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
            totalEpisodes: item.node.episodes ?? null,
            currentEpisodes: item.node.nextAiringEpisode
              ? (item.node.nextAiringEpisode.episode ?? 1) - 1
              : item.node.episodes ?? null,
            color: item.node.coverImage?.color ?? null,
            coverImage:
              item.node.coverImage?.extraLarge ??
              item.node.coverImage?.large ??
              item.node.coverImage?.medium ??
              null,
            bannerImage: item.node.bannerImage ?? null,
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
          if (rec.type !== "ANIME") return null;
          if (!animeFormat.includes(rec.format)) return null;

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
            totalEpisodes: rec.episodes ?? null,
            currentEpisodes: rec.nextAiringEpisode
              ? (rec.nextAiringEpisode.episode ?? 1) - 1
              : rec.episodes ?? null,
            color: rec.coverImage?.color ?? null,
            coverImage:
              rec.coverImage?.extraLarge ?? rec.coverImage?.large ?? rec.coverImage?.medium ?? null,
            bannerImage: rec.bannerImage ?? null,
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
}

export async function getAnimeCharactersById({ id, page, perPage }: { id: string, page: number, perPage: number }) {
  const variables = { id, page, perPage }
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
          if (!actor.languageV2) return null;
          if (!langFormat.includes(actor.languageV2.toUpperCase())) return null
  
          return {
            id: actor.id,
            name: {
              first: actor.name?.first ?? null,
              last: actor.name?.last ?? null,
              full: actor.name?.full ?? null,
              userPreferred: actor.name?.userPreferred ?? null,
            },
            language: actor.languageV2 ?? null,
            image: actor.image?.large ?? actor.image?.medium ?? null
          } as Staff
        })
        .filter(Boolean),
    }

    return character
  }) ?? []

  const result: SearchResponse = {
    currentPage: data.pageInfo?.currentPage ?? null,
    hasNextPage: data.pageInfo?.hasNextPage ?? null,
    results: characters
  }

  return result;
}