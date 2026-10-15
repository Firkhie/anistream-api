import type {
  IStreamingProvider,
  ProviderEpisodesResult,
  ProviderName,
  ProviderServer,
  StreamSourceResult,
} from "../provider.interface.js";
import type { MediaFormat } from "./anilist.enums.js";
import type { MediaTitle } from "./anilist.types.js";

import { getAnilistStreamingEpisodesById } from "./anilist.service.js";

export class AnilistProvider implements IStreamingProvider {
  readonly name: ProviderName = "anilist";

  async getMappingId({
    title: _title,
    format: _format,
  }: {
    title: MediaTitle;
    format: MediaFormat;
  }): Promise<string | null> {
    // For anilist provider, mapping ID is simply the AniList ID itself
    return null;
  }

  async getEpisodes(id: string): Promise<ProviderEpisodesResult> {
    try {
      const data = await getAnilistStreamingEpisodesById({ id });
      if (data?.status === "NOT_YET_RELEASED") {
        return { totalEpisodes: 0, episodes: [] };
      }

      let totalCount = 0;
      if (data?.nextAiringEpisode?.episode) {
        // Ongoing anime: only include episodes released so far (next episode to air - 1)
        totalCount = Math.max(0, data.nextAiringEpisode.episode - 1);
      }
      else if (data?.episodes) {
        totalCount = data.episodes;
      }
      else if (data?.streamingEpisodes?.length) {
        totalCount = data.streamingEpisodes.length;
      }

      const episodes = Array.from({ length: totalCount }, (_, i) => {
        const episode_no = i + 1;
        return {
          id: `ep-${episode_no}`,
          episode_no,
          filler: false,
        };
      });

      return {
        totalEpisodes: totalCount,
        episodes,
      };
    }
    catch (error) {
      console.error("[ANILIST_PROVIDER_ERROR]: ", error);
      return { totalEpisodes: 0, episodes: [] };
    }
  }

  async getServers(_episodeId: string): Promise<ProviderServer[]> {
    return [];
  }

  async getSource({
    id: _id,
    server: _server,
    type: _type,
  }: {
    id: string;
    server?: string;
    type?: "sub" | "dub";
  }): Promise<StreamSourceResult | null> {
    return {
      streamingLink: null,
      servers: [],
    };
  }
}

export const anilistProvider = new AnilistProvider();
