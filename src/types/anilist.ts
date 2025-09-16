// ----- Types -----
export type AnimeDetail = AnimeBasic & {
  description: string | null;
  startDate: FuzzyDate | null;
  endDate: FuzzyDate | null;
  season: MediaSeason | null;
  seasonYear: number | null;
  duration: number | null;
  countryOfOrigin: string | null;
  isLicensed: boolean | null;
  trailer: MediaTrailer | null;
  genres: string[] | null;
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
  status: MediaStatus | null;
  totalEpisodes: number | null;
  currentEpisodes: number | null;
  color: string | null;
  coverImage: string | null;
  bannerImage: string | null;
  rating: number | null;
  nextAiringEpisode: AiringSchedule | null;
};

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

export type PageInfo = {
  currentPage: number | null;
  hasNextPage: boolean | null;
};


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