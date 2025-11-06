import { getAnilistTitleById } from "../providers/anilist/anilist.service";
import { getAnizipEpisodesById } from "../providers/anizip/anizip.service";
import { getHianimeEpisodesById, getHianimeMapper } from "../providers/hianime/hianime.service";

export type Provider = "hianime" | "animekai"
export async function episodeMapper({ id, provider = "hianime" }: { id: string, provider: Provider }) {
  const ids = await animeMapper({ id })
  if (!ids) return [];

  const episodes = await getAnizipEpisodesById({ id })

  const providerIdKey = `${provider}Id` as keyof typeof ids
  const providerId = ids[providerIdKey]

  if (!providerId) return []
  
  let epsSource: any = []
  
  switch (provider) {
    case "hianime":
      epsSource = await getHianimeEpisodesById({ id: ids.hianimeId })
      break;
  
    default:
      epsSource = await getHianimeEpisodesById({ id: ids.hianimeId })
      break;
  }
  
  if (epsSource.length === 0) return []

  const mergedEpisodes = epsSource.episodes.map((item: any) => {
    return { id: item.id, ...episodes[String(item.episode_no)] }
  })  

  return mergedEpisodes;
}

export async function animeMapper({ id }: { id: string }) {
  const anilistData = await getAnilistTitleById({ id });

  if (anilistData.status === "NOT_YET_RELEASED") return null;

  const hianimeData = await getHianimeMapper({ title: anilistData.title, format: anilistData.format });

  return {
    anilistId: id,
    hianimeId: hianimeData?.id ?? null
  }
}