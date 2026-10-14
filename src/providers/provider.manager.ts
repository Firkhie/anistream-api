import type {
  IStreamingProvider,
  ProviderName,
  StreamSourceResult,
} from "./provider.interface.js";

import { BadRequestError } from "../utils/errors.js";
import { anilistProvider } from "./anilist/anilist.provider.js";
import { hianimeProvider } from "./hianime/hianime.provider.js";
import { yumaapiProvider } from "./yumaapi/yumaapi.provider.js";

export class ProviderManager {
  private providers = new Map<ProviderName, IStreamingProvider>();

  constructor() {
    this.register(anilistProvider);
    this.register(hianimeProvider);
    this.register(yumaapiProvider);
  }

  register(provider: IStreamingProvider): void {
    this.providers.set(provider.name, provider);
  }

  get(name: ProviderName): IStreamingProvider {
    const provider = this.providers.get(name);
    if (!provider) {
      throw new BadRequestError(
        `Unsupported provider '${name}'. Supported providers: ${Array.from(this.providers.keys()).join(", ")}`,
      );
    }
    return provider;
  }

  getSupportedProviders(): ProviderName[] {
    return Array.from(this.providers.keys());
  }

  /**
   * Fetches stream sources with automated graceful fallback between providers.
   * If the requested primary provider throws or returns null, attempts alternate providers.
   */
  async getSourceWithFallback({
    source,
    id,
    server = "hd-1",
    type = "sub",
  }: {
    source: ProviderName;
    id: string;
    server?: string;
    type?: "sub" | "dub";
  }): Promise<StreamSourceResult | null> {
    const primary = this.get(source);

    try {
      const result = await primary.getSource({ id, server, type });
      if (result?.streamingLink?.link?.file) {
        return result;
      }
      console.warn(
        `[ProviderManager] Primary provider '${source}' returned no playable stream for ep '${id}'. Attempting fallback...`,
      );
    }
    catch (err) {
      console.warn(
        `[ProviderManager] Primary provider '${source}' threw an error: ${(err as Error).message}. Attempting fallback...`,
      );
    }

    // Attempt alternate fallback providers
    for (const [name, provider] of this.providers.entries()) {
      if (name === source)
        continue;
      try {
        const fallbackResult = await provider.getSource({ id, server, type });
        if (fallbackResult?.streamingLink?.link?.file) {
          console.log(
            `[ProviderManager] Fallback provider '${name}' successfully resolved stream for ep '${id}'.`,
          );
          return fallbackResult;
        }
      }
      catch (fallbackErr) {
        console.warn(
          `[ProviderManager] Fallback provider '${name}' failed: ${(fallbackErr as Error).message}`,
        );
      }
    }

    return null;
  }
}

export const providerManager = new ProviderManager();
