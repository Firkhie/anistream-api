import type { MediaFormat } from "./anilist/anilist.enums.js";
import type { MediaTitle } from "./anilist/anilist.types.js";

export type ProviderName = "anilist" | "hianime" | "yumaapi";

export type StreamingTrack = {
  file: string;
  label?: string;
  kind?: string;
  default?: boolean;
};

export type IntroOutro = {
  start: number;
  end: number;
};

export type StreamingLink = {
  id: string;
  type: "sub" | "dub";
  link: {
    file: string;
    type: "hls" | "mp4" | string;
  };
  tracks: StreamingTrack[];
  intro?: IntroOutro | string | null;
  outro?: IntroOutro | string | null;
  iframe?: string | null;
  server: string;
};

export type ProviderServer = {
  type: "sub" | "dub" | "raw";
  data_id: string;
  server_id: string;
  serverName: string;
};

export type ProviderEpisode = {
  id: string | null;
  episode_no: number;
  filler?: boolean;
};

export type ProviderEpisodesResult = {
  totalEpisodes: number;
  episodes: ProviderEpisode[];
};

export type StreamSourceResult = {
  streamingLink: StreamingLink | null;
  servers: ProviderServer[];
};

/**
 * Common contract that every anime streaming and episode provider must implement.
 */
export type IStreamingProvider = {
  readonly name: ProviderName;

  /** Resolves the upstream provider's internal anime ID/slug from an AniList title and format */
  getMappingId: (params: { title: MediaTitle; format: MediaFormat }) => Promise<string | null>;

  /** Retrieves the episode list for a given provider anime ID */
  getEpisodes: (id: string) => Promise<ProviderEpisodesResult>;

  /** Retrieves available server options for a given episode ID */
  getServers: (episodeId: string) => Promise<ProviderServer[]>;

  /** Resolves the decrypted stream URL, subtitles, and server info for playback */
  getSource: (params: {
    id: string;
    server?: string;
    type?: "sub" | "dub";
  }) => Promise<StreamSourceResult | null>;
};
