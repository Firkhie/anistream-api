import type { AnizipEpisodesResponse } from "../providers/anizip/anizip.types.js";
import type { ProviderName } from "../providers/provider.interface.js";

import { getAnilistTitleById } from "../providers/anilist/anilist.service.js";
import { getAnizipEpisodesById } from "../providers/anizip/anizip.service.js";
import { providerManager } from "../providers/provider.manager.js";

export type Provider = ProviderName;

export async function episodeMapper({
  id,
  provider = "anilist",
}: {
  id: string;
  provider: Provider;
}) {
  const providerInstance = providerManager.get(provider);

  if (provider === "anilist") {
    const [episodes, epsSource] = await Promise.all([
      getAnizipEpisodesById({ id }).catch((): AnizipEpisodesResponse => ({})),
      providerInstance.getEpisodes(id),
    ]);

    if (!epsSource || !epsSource.episodes || epsSource.episodes.length === 0) {
      return [];
    }

    return epsSource.episodes.map((item) => {
      const anizipInfo = episodes[String(item.episode_no)];
      return {
        id: item.id || `ep-${item.episode_no}`,
        episode: item.episode_no,
        title: anizipInfo?.title || `Episode ${item.episode_no}`,
        description: anizipInfo?.description || "No description provided.",
        image: anizipInfo?.image || null,
        rating: anizipInfo?.rating || null,
        airDate: anizipInfo?.airDate || null,
        provider,
      };
    });
  }

  const ids = await animeMapper({ id });
  if (!ids)
    return [];

  const providerId = ids[provider === "hianime" ? "hianimeId" : "yumaapiId"];
  if (!providerId)
    return [];

  // Fetch AniZip metadata and provider episode listing concurrently
  const [episodes, epsSource] = await Promise.all([
    getAnizipEpisodesById({ id }).catch((): AnizipEpisodesResponse => ({})),
    providerInstance.getEpisodes(providerId),
  ]);

  if (!epsSource || !epsSource.episodes || epsSource.episodes.length === 0) {
    return [];
  }

  const mergedEpisodes = epsSource.episodes.map((item) => {
    return {
      id: item.id,
      provider,
      ...episodes[String(item.episode_no)],
    };
  });

  return mergedEpisodes;
}

export async function animeMapper({ id }: { id: string }) {
  const anilistData = await getAnilistTitleById({ id });
  if (anilistData.status === "NOT_YET_RELEASED")
    return null;

  const hianime = providerManager.get("hianime");
  const mappingId = await hianime.getMappingId({
    title: anilistData.title,
    format: anilistData.format,
  });

  return {
    anilistId: id,
    hianimeId: mappingId,
    yumaapiId: mappingId,
  };
}
