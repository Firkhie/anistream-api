import { describe, expect, it, vi } from "vitest";

import type {
  IStreamingProvider,
  StreamSourceResult,
} from "../src/providers/provider.interface.js";

import { ProviderManager } from "../src/providers/provider.manager.js";
import { AnilistProvider } from "../src/providers/anilist/anilist.provider.js";
import * as anilistService from "../src/providers/anilist/anilist.service.js";
import { BadRequestError } from "../src/utils/errors.js";

describe("ProviderManager", () => {
  it("initializes with default supported providers", () => {
    const manager = new ProviderManager();
    const providers = manager.getSupportedProviders();
    expect(providers).toContain("hianime");
    expect(providers).toContain("yumaapi");
  });

  it("returns provider instance by name", () => {
    const manager = new ProviderManager();
    const hianime = manager.get("hianime");
    expect(hianime.name).toBe("hianime");
  });

  it("throws BadRequestError for unsupported provider names", () => {
    const manager = new ProviderManager();
    expect(() => manager.get("crunchyroll" as any)).toThrowError(
      BadRequestError,
    );
    expect(() => manager.get("crunchyroll" as any)).toThrowError(
      /Unsupported provider 'crunchyroll'/,
    );
  });

  it("attempts fallback when primary provider returns no stream", async () => {
    const manager = new ProviderManager();

    // Mock primary provider that returns empty link
    const primaryMock: IStreamingProvider = {
      name: "hianime",
      getMappingId: vi.fn(),
      getEpisodes: vi.fn(),
      getServers: vi.fn().mockResolvedValue([]),
      getSource: vi.fn().mockResolvedValue({
        streamingLink: null,
        servers: [],
      }),
    };

    // Mock fallback provider that succeeds
    const fallbackResult: StreamSourceResult = {
      streamingLink: {
        id: "mock-fallback-ep-1",
        type: "sub",
        link: {
          file: "https://fallback.cdn/master.m3u8",
          type: "hls",
        },
        tracks: [],
        server: "yumaapi",
      },
      servers: [],
    };
    const fallbackMock: IStreamingProvider = {
      name: "yumaapi",
      getMappingId: vi.fn(),
      getEpisodes: vi.fn(),
      getServers: vi.fn().mockResolvedValue([]),
      getSource: vi.fn().mockResolvedValue(fallbackResult),
    };

    manager.register(primaryMock);
    manager.register(fallbackMock);

    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    const result = await manager.getSourceWithFallback({
      source: "hianime",
      id: "ep-123",
    });

    expect(result).toEqual(fallbackResult);
    expect(primaryMock.getSource).toHaveBeenCalled();
    expect(fallbackMock.getSource).toHaveBeenCalled();

    warnSpy.mockRestore();
    logSpy.mockRestore();
  });

  it("attempts fallback when primary provider throws an error", async () => {
    const manager = new ProviderManager();

    const primaryMock: IStreamingProvider = {
      name: "hianime",
      getMappingId: vi.fn(),
      getEpisodes: vi.fn(),
      getServers: vi.fn().mockResolvedValue([]),
      getSource: vi.fn().mockRejectedValue(new Error("HiAnime cloudflare block")),
    };

    const fallbackResult: StreamSourceResult = {
      streamingLink: {
        id: "mock-fallback-ep-2",
        type: "sub",
        link: {
          file: "https://fallback.cdn/ep2.m3u8",
          type: "hls",
        },
        tracks: [],
        server: "yumaapi",
      },
      servers: [],
    };
    const fallbackMock: IStreamingProvider = {
      name: "yumaapi",
      getMappingId: vi.fn(),
      getEpisodes: vi.fn(),
      getServers: vi.fn().mockResolvedValue([]),
      getSource: vi.fn().mockResolvedValue(fallbackResult),
    };

    manager.register(primaryMock);
    manager.register(fallbackMock);

    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    const result = await manager.getSourceWithFallback({
      source: "hianime",
      id: "ep-456",
    });

    expect(result).toEqual(fallbackResult);
    expect(primaryMock.getSource).toHaveBeenCalled();
    expect(fallbackMock.getSource).toHaveBeenCalled();

    warnSpy.mockRestore();
    logSpy.mockRestore();
  });
});

describe("AnilistProvider", () => {
  it("returns only released episodes for ongoing anime with nextAiringEpisode", async () => {
    const provider = new AnilistProvider();
    const serviceSpy = vi
      .spyOn(anilistService, "getAnilistStreamingEpisodesById")
      .mockResolvedValueOnce({
        status: "RELEASING",
        episodes: 12,
        nextAiringEpisode: { episode: 5 },
        streamingEpisodes: [],
      });

    const result = await provider.getEpisodes("12345");
    expect(result.totalEpisodes).toBe(4);
    expect(result.episodes).toHaveLength(4);
    expect(result.episodes[0].episode_no).toBe(1);
    expect(result.episodes[3].episode_no).toBe(4);

    serviceSpy.mockRestore();
  });

  it("returns 0 episodes when status is NOT_YET_RELEASED", async () => {
    const provider = new AnilistProvider();
    const serviceSpy = vi
      .spyOn(anilistService, "getAnilistStreamingEpisodesById")
      .mockResolvedValueOnce({
        status: "NOT_YET_RELEASED",
        episodes: 12,
        nextAiringEpisode: { episode: 1 },
        streamingEpisodes: [],
      });

    const result = await provider.getEpisodes("99999");
    expect(result.totalEpisodes).toBe(0);
    expect(result.episodes).toHaveLength(0);

    serviceSpy.mockRestore();
  });

  it("returns all episodes for finished anime without nextAiringEpisode", async () => {
    const provider = new AnilistProvider();
    const serviceSpy = vi
      .spyOn(anilistService, "getAnilistStreamingEpisodesById")
      .mockResolvedValueOnce({
        status: "FINISHED",
        episodes: 24,
        nextAiringEpisode: null,
        streamingEpisodes: [],
      });

    const result = await provider.getEpisodes("54321");
    expect(result.totalEpisodes).toBe(24);
    expect(result.episodes).toHaveLength(24);

    serviceSpy.mockRestore();
  });
});
