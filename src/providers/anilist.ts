import { AnimeBasic, AnimeDetail, Character, MediaFormat, MediaRelation, Staff, StaffLanguage, StaffLanguageV2 } from "../types/anilist";
import { anilistCharacterQuery, anilistDetailQuery } from "../utils/queries";

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

export async function fetchAnimeDetailById(id: string) {
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
      id: id
    }
    animeDetail.idMal = data.idMal
    animeDetail.title = {
      romaji: data.title.romaji,
      english: data.title.english,
      native: data.title.native,
      userPreferred: data.title.userPreferred
    }
    animeDetail.format = data.format
    animeDetail.status = data.status
    animeDetail.description = data.description
    animeDetail.startDate = {
      year: data.startDate.year,
      month: data.startDate.month,
      day: data.startDate.day,
    }
    animeDetail.endDate = {
      year: data.endDate.year,
      month: data.endDate.month,
      day: data.endDate.day,
    }
    animeDetail.season = data.season
    animeDetail.seasonYear = data.seasonYear
    animeDetail.totalEpisodes = data.episodes
    animeDetail.currentEpisodes = data.nextAiringEpisode ? data.nextAiringEpisode.episode - 1 : data.episodes
    animeDetail.duration = data.duration
    animeDetail.countryOfOrigin = data.countryOfOrigin
    animeDetail.isLicensed = data.isLicensed
    animeDetail.trailer = {
      id: data.trailer.id,
      site: data.trailer.site,
      thumbnail: data.trailer.thumbnail,
    }
    animeDetail.color = data.coverImage.color
    animeDetail.coverImage = data.coverImage.extraLarge ?? data.coverImage.large ?? data.coverImage.medium;
    animeDetail.bannerImage = data.bannerImage;
    animeDetail.genres = data.genres;
    animeDetail.synonyms = data.synonyms;
    animeDetail.rating = data.averageScore;
    animeDetail.popularity = data.popularity;
    animeDetail.isAdult = data.isAdult;
    animeDetail.source = data.source;
    if (data.nextAiringEpisode) {
      animeDetail.nextAiringEpisode = {
        airingAt: data.nextAiringEpisode.airingAt,
        episode: data.nextAiringEpisode.episode,
        timeUntilAiring: data.nextAiringEpisode.timeUntilAiring,
      }
    }
    animeDetail.studios = data.studios.edges.map((item: any) => item.node.name)
    animeDetail.relations = data.relations.edges.map((item: any) => {
      if (item.node.type !== "ANIME") return null
      if (!animeFormat.includes(item.node.format)) return null

      const relation: AnimeBasic & { relationType: MediaRelation } = {
        id: item.node.id,
        idMal: item.node.idMal,
        title: {
          romaji: item.node.title.romaji,
          english: item.node.title.english,
          native: item.node.title.native,
          userPreferred: item.node.title.userPreferred,
        },
        format: item.node.format,
        status: item.node.status,
        totalEpisodes: item.node.episodes,
        currentEpisodes: item.node.nextAiringEpisode ? item.node.nextAiringEpisode.episode - 1 : item.node.episodes,
        color: item.node.coverImage.color,
        coverImage: item.node.coverImage.extraLarge ?? item.node.coverImage.large ?? item.node.coverImage.medium,
        bannerImage: item.node.bannerImage,
        rating: item.node.averageScore,
        relationType: item.relationType
      }

      if (item.node.nextAiringEpisode) {
        relation.nextAiringEpisode = {
          airingAt: item.node.nextAiringEpisode.airingAt,
          episode: item.node.nextAiringEpisode.episode,
          timeUntilAiring: item.node.nextAiringEpisode.timeUntilAiring,
        }
      }
      
      return relation
    }).filter(Boolean)
    animeDetail.characters = data.characters.edges.map((item: any) => {
      const character: Character = {
        id: item.node.id,
        role: item.role,
        name: {
          first: item.node.name.first,
          last: item.node.name.last,
          full: item.node.name.full,
          userPreferred: item.node.name.userPreferred,
        },
        image: item.node.image.large ?? item.node.image.medium
      }
      character.voiceActors = item.voiceActors.map((actor: any) => {
        return {
          id: actor.id,
          name: {
            first: actor.name.first,
            last: actor.name.last,
            full: actor.name.full,
            userPreferred: actor.name.userPreferred,
          },
          language: actor.languageV2,
          image: actor.image.large ?? actor.image.medium
        } as Staff
      })

      return character;
    })
    animeDetail.recommendations = data.recommendations.edges.map((item: any) => {
      if (item.node.mediaRecommendation.type !== "ANIME") return null
      if (!animeFormat.includes(item.node.mediaRecommendation.format)) return null

      const recommendation: AnimeBasic = {
        id: item.node.mediaRecommendation.id,
        idMal: item.node.mediaRecommendation.idMal,
        title: {
          romaji: item.node.mediaRecommendation.title.romaji,
          english: item.node.mediaRecommendation.title.english,
          native: item.node.mediaRecommendation.title.native,
          userPreferred: item.node.mediaRecommendation.title.userPreferred,
        },
        format: item.node.mediaRecommendation.format,
        status: item.node.mediaRecommendation.status,
        totalEpisodes: item.node.mediaRecommendation.episodes,
        currentEpisodes: item.node.mediaRecommendation.nextAiringEpisode ? item.node.mediaRecommendation.nextAiringEpisode.episode - 1 : item.node.mediaRecommendation.episodes,
        color: item.node.mediaRecommendation.coverImage.color,
        coverImage: item.node.mediaRecommendation.coverImage.extraLarge ?? item.node.mediaRecommendation.coverImage.large ?? item.node.mediaRecommendation.coverImage.medium,
        bannerImage: item.node.mediaRecommendation.bannerImage,
        rating: item.node.mediaRecommendation.averageScore,
      }

      if (item.node.mediaRecommendation.nextAiringEpisode) {
        recommendation.nextAiringEpisode = {
          airingAt: item.node.mediaRecommendation.nextAiringEpisode.airingAt,
          episode: item.node.mediaRecommendation.nextAiringEpisode.episode,
          timeUntilAiring: item.node.mediaRecommendation.nextAiringEpisode.timeUntilAiring,
        }
      }
      
      return recommendation
    }).filter(Boolean)

    return animeDetail
  } catch (error) {
    throw new Error((error as Error).message)
  }
}

export async function fetchCharactersById(id: string, page: number = 1) {
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

    const characters: Character[] = data.characters.edges.map((item: any) => {
      const character: Character = {
        id: item.node.id,
        role: item.role,
        name: {
          first: item.node.name.first,
          last: item.node.name.last,
          full: item.node.name.full,
          userPreferred: item.node.name.userPreferred,
        },
        image: item.node.image.large ?? item.node.image.medium
      }
      character.voiceActors = item.voiceActors.map((actor: any) => {
        if (!langFormat.includes(actor.languageV2.toUpperCase())) return null

        return {
          id: actor.id,
          name: {
            first: actor.name.first,
            last: actor.name.last,
            full: actor.name.full,
            userPreferred: actor.name.userPreferred,
          },
          language: actor.languageV2,
          image: actor.image.large ?? actor.image.medium
        } as Staff
      }).filter(Boolean)

      return character
    })

    return characters;
  } catch (error) {
    throw new Error((error as Error).message)
  }
}
