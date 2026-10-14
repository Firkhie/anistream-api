import type { MediaFormat } from "../anilist/anilist.enums.js";
import type { MediaTitle } from "../anilist/anilist.types.js";
import type {
  IStreamingProvider,
  ProviderEpisodesResult,
  ProviderName,
  ProviderServer,
  StreamSourceResult,
} from "../provider.interface.js";

import { getHianimeMapper } from "../hianime/hianime.service.js";
import { getYumaapiEpisodesById, getYumaapiSource } from "./yumaapi.service.js";

export class YumaapiProvider implements IStreamingProvider {
  readonly name: ProviderName = "yumaapi";

  async getMappingId({
    title,
    format,
  }: {
    title: MediaTitle;
    format: MediaFormat;
  }): Promise<string | null> {
    // Current codebase uses HiAnime title mapping slug for YumaAPI queries
    const res = await getHianimeMapper({ title, format });
    return res.id;
  }

  async getEpisodes(id: string): Promise<ProviderEpisodesResult> {
    const data = await getYumaapiEpisodesById({ id });
    return {
      totalEpisodes: data.totalEpisodes,
      episodes: data.episodes.map(ep => ({
        id: ep.id,
        episode_no: ep.episode_no,
        filler: ep.filler,
      })),
    };
  }

  async getServers(_episodeId: string): Promise<ProviderServer[]> {
    return [];
  }

  async getSource({
    id,
    type = "sub",
  }: {
    id: string;
    server?: string;
    type?: "sub" | "dub";
  }): Promise<StreamSourceResult | null> {
    return getYumaapiSource({ id, type });
  }
}

export const yumaapiProvider = new YumaapiProvider();
