import { getAnilistTitleById } from "../providers/anilist/anilist.service";
import { getAnizipEpisodesById } from "../providers/anizip/anizip.service";
import { getHianimeEpisodesById, getHianimeMapper } from "../providers/hianime/hianime.service";

export async function episodeMapper({ id }: { id: string }) {
  const ids = await animeMapper({ id })
  const episodes = await getAnizipEpisodesById({ id })
  const epsSource = await getHianimeEpisodesById({ id: ids.hianimeId })

  const mergedEpisodes = epsSource.episodes.map((item) => {
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