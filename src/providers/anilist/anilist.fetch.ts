import { UpstreamError } from "../../utils/errors.js";

const BASE_URL = "https://graphql.anilist.co";
const ANILIST_IDS_URL = "https://raw.githubusercontent.com/5H4D0WILA/IDFetch/main/ids.txt";

const HEADERS = {
  "Content-Type": "application/json",
  "Accept": "application/json",
  "User-Agent": "AniStream/1.0 (https://github.com/Firkhie/anistream)",
};

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchAnilist({ query, variables }: any) {
  const options = {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify({ query, variables }),
  };

  const MAX_RETRIES = 2;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(BASE_URL, {
        ...options,
        signal: AbortSignal.timeout(8000),
      });

      // Handle AniList rate limiting (429)
      if (response.status === 429) {
        if (attempt < MAX_RETRIES) {
          const retryAfter = Number(response.headers.get("retry-after")) || 1;
          await sleep(Math.min(retryAfter * 1000, 1500));
          continue;
        }
        throw new UpstreamError("AniList rate limit reached. Please try again shortly.");
      }

      if (!response.ok) {
        const errorJson = await response.json().catch(() => null);
        const errorMsg = errorJson?.errors?.[0]?.message || response.statusText || `HTTP ${response.status}`;
        throw new UpstreamError(`AniList upstream error: ${errorMsg}`);
      }

      const json = await response.json();
      if (json.errors && !json.data) {
        throw new UpstreamError(json.errors[0]?.message || "AniList GraphQL error");
      }

      return json;
    }
    catch (error: any) {
      lastError = error;
      if (error instanceof UpstreamError && attempt >= MAX_RETRIES) {
        throw error;
      }
      if (attempt < MAX_RETRIES) {
        await sleep(500 * attempt);
        continue;
      }
    }
  }

  throw new UpstreamError(lastError?.message || "AniList upstream request failed");
}

export async function fetchAnilistIds() {
  try {
    const response = await fetch(ANILIST_IDS_URL, {
      signal: AbortSignal.timeout(8000),
      headers: {
        "User-Agent": "AniStream/1.0",
      },
    });
    if (!response.ok) {
      throw new UpstreamError(`Failed to fetch AniList IDs: ${response.statusText}`);
    }
    return response.text();
  }
  catch (error) {
    if (error instanceof UpstreamError) throw error;
    throw new UpstreamError((error as Error).message);
  }
}
