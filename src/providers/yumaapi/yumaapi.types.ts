export type YumaapiEpisode = {
  id: string | null;
  episode_no: number;
  filler: boolean;
};

export type YumaapiEpisodesResult = {
  totalEpisodes: number;
  episodes: YumaapiEpisode[];
};