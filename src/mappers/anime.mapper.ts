import { getAnilistTitleById } from "../providers/anilist/anilist.service";
import { getAnizipEpisodesById } from "../providers/anizip/anizip.service";
import { getHianimeEpisodesById, getHianimeMapper } from "../providers/hianime/hianime.service";

export type Provider = "hianime" | "animekai"
export async function episodeMapper({ id, provider = "hianime" }: { id: string, provider: Provider }) {
  const ids = await animeMapper({ id })
  const episodes = await getAnizipEpisodesById({ id })
  
  let epsSource: any = []
  switch (provider) {
    case "hianime":
      epsSource = await getHianimeEpisodesById({ id: ids.hianimeId })
      break;
  
    default:
      epsSource = await getHianimeEpisodesById({ id: ids.hianimeId })
      break;
  }

  const mergedEpisodes = epsSource.episodes.map((item: any) => {
    return { id: item.id, ...episodes[String(item.episode_no)] }
  })  

  return mergedEpisodes;
}

export async function animeMapper({ id }: { id: string }) {
  const anilistData = await getAnilistTitleById({ id });
  const hianimeData = await getHianimeMapper({ title: anilistData });

  return {
    anilistId: id,
    hianimeId: hianimeData?.id ?? null
  }
}