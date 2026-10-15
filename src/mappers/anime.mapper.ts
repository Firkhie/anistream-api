import type { AnizipEpisodesResponse } from "../providers/anizip/anizip.types.js";
import type { ProviderName } from "../providers/provider.interface.js";

import { getAnilistTitleById } from "../providers/anilist/anilist.service.js";
import { getAnizipEpisodesById } from "../providers/anizip/anizip.service.js";
import { providerManager } from "../providers/provider.manager.js";

export type Provider = ProviderName;

function isEpisodeReleased({
  episodeNumber,
  maxReleasedEpisode,
  airDate,
}: {
  episodeNumber: number | null | undefined;
  maxReleasedEpisode: number | null;
  airDate?: string | null;
}): boolean {
  if (maxReleasedEpisode !== null && episodeNumber != null) {
    if (episodeNumber > maxReleasedEpisode) {
      return false;
    }
  }

  if (airDate) {
    const airTimestamp = new Date(airDate).getTime();
    // Allow a 1-day buffer (86400000ms) for timezone differences
    if (!Number.isNaN(airTimestamp) && airTimestamp > Date.now() + 86400000) {
      return false;
    }
  }

  return true;
}

export async function episodeMapper({
  id,
  provider = "anilist",
}: {
  id: string;
  provider: Provider;
}) {
  const providerInstance = providerManager.get(provider);

  // Fetch AniList metadata to accurately determine release status and latest aired episode
  const anilistData = await getAnilistTitleById({ id }).catch(() => null);

  if (anilistData?.status === "NOT_YET_RELEASED") {
    return [];
  }

  let maxReleasedEpisode: number | null = null;
  if (anilistData?.nextAiringEpisode?.episode) {
    // For ongoing anime: only episodes before nextAiringEpisode have aired
    maxReleasedEpisode = Math.max(0, anilistData.nextAiringEpisode.episode - 1);
  } else if (anilistData?.status === "FINISHED" && anilistData?.episodes) {
    maxReleasedEpisode = anilistData.episodes;
  }

  if (provider === "anilist") {
    const [episodes, epsSource] = await Promise.all([
      getAnizipEpisodesById({ id }).catch((): AnizipEpisodesResponse => ({})),
      providerInstance.getEpisodes(id),
    ]);

    if (!epsSource || !epsSource.episodes || epsSource.episodes.length === 0) {
      return [];
    }

    return epsSource.episodes
      .filter((item) => {
        const anizipInfo = episodes[String(item.episode_no)];
        return isEpisodeReleased({
          episodeNumber: item.episode_no,
          maxReleasedEpisode,
          airDate: anizipInfo?.airDate,
        });
      })
      .map((item) => {
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

  const ids = await animeMapper({ id, anilistData });
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

  const mergedEpisodes = epsSource.episodes
    .filter((item) => {
      const anizipInfo = episodes[String(item.episode_no)];
      return isEpisodeReleased({
        episodeNumber: item.episode_no,
        maxReleasedEpisode,
        airDate: anizipInfo?.airDate,
      });
    })
    .map((item) => {
      return {
        id: item.id,
        provider,
        ...episodes[String(item.episode_no)],
      };
    });

  return mergedEpisodes;
}

export async function animeMapper({ id, anilistData: existingData }: { id: string; anilistData?: any }) {
  const anilistData = existingData || (await getAnilistTitleById({ id }));
  if (anilistData?.status === "NOT_YET_RELEASED")
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
