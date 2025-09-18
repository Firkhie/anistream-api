import { fetchAnizipEpisodesById } from "./anizip.fetch";

export async function getAnizipEpisodesById({ id }: { id: string }) {
  const data = (await fetchAnizipEpisodesById({ id })).episodes;

  const episodes = {}
  for (const eps in data) {
    episodes[data[eps].episodeNumber] = ({
      title: data[eps].title.en || data[eps].title['x-jat'],
      episode: data[eps].episodeNumber,
      description: data[eps].overview,
      image: data[eps].image,
      rating: data[eps].rating,
      airDate: data[eps].airDate
    })
  }
  
  return episodes;
}