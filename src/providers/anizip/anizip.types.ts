export type AnizipEpisode = {
  title: string | null;
  episode: number | null;
  description: string | null;
  image: string | null;
  rating: string | null;
  airDate: string | null;
};

export type AnizipEpisodesResponse = {
  [key: string]: AnizipEpisode;
};