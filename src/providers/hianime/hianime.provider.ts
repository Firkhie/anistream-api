import type { MediaFormat } from "../anilist/anilist.enums.js";
import type { MediaTitle } from "../anilist/anilist.types.js";
import type {
  IStreamingProvider,
  ProviderEpisodesResult,
  ProviderName,
  ProviderServer,
  StreamSourceResult,
} from "../provider.interface.js";

import {
  getHianimeEpisodesById,
  getHianimeMapper,
  getHianimeServersByEpisodeId,
  getHianimeSource,
} from "./hianime.service.js";

export class HianimeProvider implements IStreamingProvider {
  readonly name: ProviderName = "hianime";

  async getMappingId({
    title,
    format,
  }: {
    title: MediaTitle;
    format: MediaFormat;
  }): Promise<string | null> {
    const res = await getHianimeMapper({ title, format });
    return res.id;
  }

  async getEpisodes(id: string): Promise<ProviderEpisodesResult> {
    const data = await getHianimeEpisodesById({ id });
    if (!data || Array.isArray(data) || !("episodes" in data)) {
      return { totalEpisodes: 0, episodes: [] };
    }
    return {
      totalEpisodes: data.totalEpisodes,
      episodes: data.episodes.map(ep => ({
        id: ep.id,
        episode_no: ep.episode_no,
        filler: ep.filler,
      })),
    };
  }

  async getServers(episodeId: string): Promise<ProviderServer[]> {
    const servers = await getHianimeServersByEpisodeId({ id: episodeId });
    return servers.map(s => ({
      type: s.type,
      data_id: s.data_id,
      server_id: s.server_id,
      serverName: s.serverName,
    }));
  }

  async getSource({
    id,
    server = "hd-1",
    type = "sub",
  }: {
    id: string;
    server?: string;
    type?: "sub" | "dub";
  }): Promise<StreamSourceResult | null> {
    return getHianimeSource({ id, server, type });
  }
}

export const hianimeProvider = new HianimeProvider();
