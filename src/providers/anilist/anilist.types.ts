import { 
  CharacterRole, 
  GenreCollection, 
  MediaFormat, 
  MediaRelation, 
  MediaSeason, 
  MediaSort, 
  MediaStatus, 
  MediaType, 
  StaffLanguage, 
  StaffLanguageV2 
} from "./anilist.enums";

export type AnimeDetail = AnimeBasic & {
  startDate: FuzzyDate | null;
  endDate: FuzzyDate | null;
  season: MediaSeason | null;
  seasonYear: number | null;
  duration: number | null;
  countryOfOrigin: string | null;
  isLicensed: boolean | null;
  trailer: MediaTrailer | null;
  genres: GenreCollection[] | null;
  synonyms: string[] | null;
  isAdult: boolean | null;
  popularity: number | null;
  source: MediaSource | null;
  studios: string[] | null;
  relations: (AnimeBasic & { relationType: MediaRelation })[] | null;
  characters: Character[] | null;
  recommendations: AnimeBasic[] | null;
};

export type AnimeBasic = {
  id: string;
  idMal: string | null;
  title: MediaTitle | null;
  format: MediaFormat | null;
  description: string | null;
  status: MediaStatus | null;
  totalEpisodes: number | null;
  currentEpisodes: number | null;
  color: string | null;
  coverImage: string | null;
  bannerImage: string | null;
  rating: number | null;
  nextAiringEpisode: AiringSchedule | null;
};

export type MediaVariables = {
  page: number,
  perPage: number,
  season?: MediaSeason,
  seasonYear?: number,
  type?: MediaType,
  format?: MediaFormat,
  status?: MediaStatus,
  isAdult?: boolean,
  search?: string,
  formatIn?: MediaFormat[],
  statusIn?: MediaStatus[],
  genreIn?: GenreCollection[],
  averageScoreGreater?: number,
  averageScoreLesser?: number,
  sort?: MediaSort[],
}

export type MediaTitle = {
  romaji: string | null;
  english: string | null;
  native: string | null;
  userPreferred: string | null;
};

export type MediaTrailer = {
  id: string | null;
  site: string | null;
  thumbnail: string | null;
};

export type MediaCoverImage = {
  extraLarge: string | null;
  large: string | null;
  medium: string | null;
  color: string | null;
};

export type FuzzyDate = {
  year: number | null;
  month: number | null;
  day: number | null;
};

export type AiringSchedule = {
  airingAt: number;
  timeUntilAiring: number;
  episode: number;
};

export type Character = {
  id: string;
  role: CharacterRole | null;
  name: CharacterName | null;
  image: string | null;
  voiceActors: Staff[] | null;
};

export type Staff = {
  id: string;
  name: StaffName | null;
  image: string | null;
  language: StaffLanguage | StaffLanguageV2;
};

export type CharacterName = {
  first: string | null;
  last: string | null;
  full: string | null;
  userPreferred: string | null;
};

export type StaffName = {
  first: string | null;
  last: string | null;
  full: string | null;
  userPreferred: string | null;
};

export type SearchResponse = {
  currentPage: number | null;
  hasNextPage: boolean | null;
  results: AnimeBasic[] | Character[];
};