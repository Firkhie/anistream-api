export type HianimeEpisode = {
  id: string | null;
  episode_no: number;
  filler: boolean;
};

export type HianimeEpisodesResult = {
  totalEpisodes: number;
  episodes: HianimeEpisode[];
};

export type HianimeListResult = {
  id: string | null;
  title: {
    english: string | null;
    romaji: string | null;
  }
}

export type HianimeServersResult = {
  
}