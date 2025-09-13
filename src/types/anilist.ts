// ----- Types -----
export type AnimeDetail = AnimeBasic & {
  description?: string;
  startDate?: FuzzyDate;
  endDate?: FuzzyDate;
  season?: MediaSeason;
  seasonYear?: number;
  duration?: number;
  countryOfOrigin?: string;
  isLicensed?: boolean;
  trailer?: MediaTrailer;
  genres?: string[];
  synonyms?: string[];
  isAdult?: boolean;
  popularity?: number;
  source?: MediaSource;
  studios?: string[];
  relations?: (AnimeBasic & { relationType: MediaRelation })[];
  characters?: Character[];
  recommendations?: AnimeBasic[];
}

export type AnimeBasic = {
  id: string;
  idMal?: string;
  title?: MediaTitle;
  format?: MediaFormat;
  status?: MediaStatus;
  totalEpisodes?: number;
  currentEpisodes?: number;
  color?: string;
  coverImage?: string;
  bannerImage?: string;
  rating?: number;
  nextAiringEpisode?: AiringSchedule;
}

export type MediaTitle = {
  romaji?: string;
  english?: string;
  native?: string;
  userPreferred?: string;
}

export type MediaTrailer = {
  id?: string;
  site?: string;
  thumbnail?: string;
}

export type MediaCoverImage = {
  extraLarge?: string;
  large?: string;
  medium?: string;
  color?: string;
}

export type FuzzyDate = {
  year?: number;
  month?: number;
  day?: number;
}

export type AiringSchedule = {
  airingAt: number;
  timeUntilAiring: number;
  episode: number;
}

export type Character = {
  id: string;
  role?: CharacterRole;
  name?: CharacterName;
  image?: string;
  voiceActors?: Staff[];
}

export type Staff = {
  id: string;
  name?: StaffName;
  image?: string;
  language: StaffLanguage | StaffLanguageV2
}

export type CharacterName = {
  first?: string;
  last?: string;
  full?: string;
  userPreferred?: string;
}

export type StaffName = {
  first?: string;
  last?: string;
  full?: string;
  userPreferred?: string;
}

export type PageInfo = {
  currentPage?: number;
  hasNextPage?: Boolean;
}

// ----- Enums -----
export enum MediaFormat {
  TV = 'TV',
  TV_SHORT = 'TV_SHORT',
  MOVIE = 'MOVIE',
  SPECIAL = 'SPECIAL',
  OVA = 'OVA',
  ONA = 'ONA',
  MUSIC = 'MUSIC',
  MANGA = 'MANGA',
  NOVEL = 'NOVEL',
  ONE_SHOT = 'ONE_SHOT',
}

export enum MediaSort {
  ID = "ID",
  ID_DESC = "ID_DESC",
  TITLE_ROMAJI = "TITLE_ROMAJI",
  TITLE_ROMAJI_DESC = "TITLE_ROMAJI_DESC",
  TITLE_ENGLISH = "TITLE_ENGLISH",
  TITLE_ENGLISH_DESC = "TITLE_ENGLISH_DESC",
  TITLE_NATIVE = "TITLE_NATIVE",
  TITLE_NATIVE_DESC = "TITLE_NATIVE_DESC",
  TYPE = "TYPE",
  TYPE_DESC = "TYPE_DESC",
  FORMAT = "FORMAT",
  FORMAT_DESC = "FORMAT_DESC",
  START_DATE = "START_DATE",
  START_DATE_DESC = "START_DATE_DESC",
  END_DATE = "END_DATE",
  END_DATE_DESC = "END_DATE_DESC",
  SCORE = "SCORE",
  SCORE_DESC = "SCORE_DESC",
  POPULARITY = "POPULARITY",
  POPULARITY_DESC = "POPULARITY_DESC",
  TRENDING = "TRENDING",
  TRENDING_DESC = "TRENDING_DESC",
  EPISODES = "EPISODES",
  EPISODES_DESC = "EPISODES_DESC",
  DURATION = "DURATION",
  DURATION_DESC = "DURATION_DESC",
  STATUS = "STATUS",
  STATUS_DESC = "STATUS_DESC",
  CHAPTERS = "CHAPTERS",
  CHAPTERS_DESC = "CHAPTERS_DESC",
  VOLUMES = "VOLUMES",
  VOLUMES_DESC = "VOLUMES_DESC",
  UPDATED_AT = "UPDATED_AT",
  UPDATED_AT_DESC = "UPDATED_AT_DESC",
  SEARCH_MATCH = "SEARCH_MATCH",
  FAVOURITES = "FAVOURITES",
  FAVOURITES_DESC = "FAVOURITES_DESC",
}

export enum MediaType {
  ANIME = 'ANIME',
  MANGA = 'MANGA'
}

export enum MediaStatus {
  FINISHED = 'FINISHED',
  RELEASING = 'RELEASING',
  NOT_YET_RELEASED = 'NOT_YET_RELEASED',
  CANCELLED = 'CANCELLED',
  HIATUS = 'HIATUS'
}

export enum MediaSeason {
  WINTER = 'WINTER',
  SPRING = 'SPRING',
  SUMMER = 'SUMMER',
  FALL = 'FALL'
}

export enum MediaRelation {
  ADAPTION = 'ADAPTION',  
  PREQUEL = 'PREQUEL',  
  SEQUEL = 'SEQUEL',  
  PARENT = 'PARENT',  
  SIDE_STORY = 'SIDE_STORY',  
  CHARACTER = 'CHARACTER',  
  SUMMARY = 'SUMMARY',  
  ALTERNATIVE = 'ALTERNATIVE',  
  SPIN_OFF = 'SPIN_OFF',  
  OTHER = 'OTHER',  
  SOURCE = 'SOURCE',  
  COMPILATION = 'COMPILATION',  
  CONTAINS = 'CONTAINS',  
}

export enum MediaSource {
  ORIGINAL = 'ORIGINAL',
  MANGA = 'MANGA',
  LIGHT_NOVEL = 'LIGHT_NOVEL',
  VISUAL_NOVEL = 'VISUAL_NOVEL',
  VIDEO_GAME = 'VIDEO_GAME',
  OTHER = 'OTHER',
  NOVEL = 'NOVEL',
  DOUJINSHI = 'DOUJINSHI',
  ANIME = 'ANIME',
  WEB_NOVEL = 'WEB_NOVEL',
  LIVE_ACTION = 'LIVE_ACTION',
}

export enum StaffLanguage {
  JAPANESE = 'JAPANESE',
  ENGLISH = 'ENGLISH',
  KOREAN = 'KOREAN',
  ITALIAN = 'ITALIAN',
  SPANISH = 'SPANISH',
  PORTUGUESE = 'PORTUGUESE',
  FRENCH = 'FRENCH',
  GERMAN = 'GERMAN',
  HEBREW = 'HEBREW',
  HUNGARIAN = 'HUNGARIAN',
}

export enum StaffLanguageV2 {
  JAPANESE = 'JAPANESE',
  ENGLISH = 'ENGLISH',
  KOREAN = 'KOREAN',
  ITALIAN = 'ITALIAN',
  SPANISH = 'SPANISH',
  PORTUGUESE = 'PORTUGUESE',
  FRENCH = 'FRENCH',
  GERMAN = 'GERMAN',
  HEBREW = 'HEBREW',
  HUNGARIAN = 'HUNGARIAN',
  CHINESE = 'CHINESE',
  ARABIC = 'ARABIC',
  FILIPINO = 'FILIPINO',
  CATALAN = 'CATALAN',
  FINNISH = 'FINNISH',
  TURKISH = 'TURKISH',
  DUTCH = 'DUTCH',
  SWEDISH = 'SWEDISH',
  THAI = 'THAI',
  TAGALOG = 'TAGALOG',
  MALAYSIAN = 'MALAYSIAN',
  INDONESIAN = 'INDONESIAN',
  VIETNAMESE = 'VIETNAMESE',
  NEPALI = 'NEPALI',
  HINDI = 'HINDI',
  URDU = 'URDU',
}

export enum CharacterRole {
  MAIN = 'MAIN',
  SUPPORTING = 'SUPPORTING',
  BACKGROUND = 'BACKGROUND',
}