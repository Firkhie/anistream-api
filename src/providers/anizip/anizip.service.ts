import { fetchAnizipEpisodesById } from "./anizip.fetch";
import { AnizipEpisode, AnizipEpisodesResponse } from "./anizip.types";

export async function getAnizipEpisodesById({ id }: { id: string }) {
  const data = (await fetchAnizipEpisodesById({ id })).episodes;
  
  const episodes: AnizipEpisodesResponse = {}

  for (const eps in data) {
    const raw = data[eps];

    const episode: AnizipEpisode = {
      title: raw.title?.en || raw.title?.["x-jat"] || `Episode ${eps}`,
      episode: Number(raw.episodeNumber) || Number(raw.episode) || Number(eps),
      description: raw.overview || raw.summary || "No description provided.",
      image: raw.image ?? null,
      rating: raw.rating ?? null,
      airDate: raw.airDate ?? null,
    };

    episodes[eps] = episode;
  }
  
  return episodes;
}