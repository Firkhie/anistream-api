import { describe, expect, it, vi } from "vitest";

import type {
  IStreamingProvider,
  StreamSourceResult,
} from "../src/providers/provider.interface.js";

import { ProviderManager } from "../src/providers/provider.manager.js";
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
