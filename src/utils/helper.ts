import { MediaSeason } from "../providers/anilist/anilist.enums";

export function getSeason(): MediaSeason {
  const month = new Date().getMonth() + 1;

  if (month >= 1 && month <= 3) {
    return MediaSeason.WINTER;
  } else if (month >= 4 && month <= 6) {
    return MediaSeason.SPRING;
  } else if (month >= 7 && month <= 9) {
    return MediaSeason.SUMMER;
  } else {
    return MediaSeason.FALL;
  }
}