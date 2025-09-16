import { AnimeDetail, Character, MediaFormat, MediaSeason, MediaSort, MediaType, MediaVariables, Staff, StaffLanguageV2 } from "../types/anilist";
import { getSeason } from "../utils/helper";
import { anilistCharacterQuery, anilistDetailQuery, anilistSearchQuery } from "../utils/queries";

const BASE_URL = 'https://graphql.anilist.co';
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

export async function fetchAnimePopular({ page = 1 }: { page: number }) {
  const year = new Date().getFullYear();
  const variables: MediaVariables = {
    page: page,
    perPage: 20,
    type: MediaType.ANIME,
    sort: [
      MediaSort.POPULARITY_DESC
    ],
    seasonYear: year,
    season: getSeason()
  }
  const options = {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    body: JSON.stringify({
        query: anilistSearchQuery,
        variables: variables
    })
  }
  try {
    const response = await fetch(BASE_URL, options);
    const data = (await response.json()).data.Page.media;
    return data;
  } catch (error) {
    throw new Error((error as Error).message)
  }
}

export async function fetchAnimeTrending({ page = 1 }: { page: number }) {
  const variables: MediaVariables = {
    page: page,
    perPage: 20,
    type: MediaType.ANIME,
    sort: [
      MediaSort.TRENDING_DESC
    ],
  }
  const options = {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    body: JSON.stringify({
        query: anilistSearchQuery,
        variables: variables
    })
  }
  try {
    const response = await fetch(BASE_URL, options);
    const data = (await response.json()).data.Page.media;
    return data;
  } catch (error) {
    throw new Error((error as Error).message)
  }
}

export async function fetchAnimeDetailById({ id }: { id: string }) {
  const variables = {
    id: id,
    type: "ANIME",
    charPage: 1,
    charPerPage: 6,
    actorLang: "JAPANESE",
    recomPage: 1,
    recomPerPage: 10,
    isMainStudio: true
  }
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      query: anilistDetailQuery,
      variables: variables
    })
  }
  try {
    const response = await fetch(BASE_URL, options);
    const data = (await response.json()).data.Media;

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
  } catch (error) {
    throw new Error((error as Error).message)
  }
}

export async function fetchAnimeCharactersById({ id, page = 1 }: { id: string, page: number }) {
  const variables = {
    id: id,
    page: page,
    perPage: 10,
  }
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      query: anilistCharacterQuery,
      variables: variables
    })
  }
  try {
    const response = await fetch(BASE_URL, options);
    const data = (await response.json()).data.Media;

    const characters: Character[] = data.characters?.edges?.map((item: any) => {
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
          .filter((a: Staff): a is Staff => a !== null),
      }

      return character
    }) ?? []

    return characters;
  } catch (error) {
    throw new Error((error as Error).message)
  }
}