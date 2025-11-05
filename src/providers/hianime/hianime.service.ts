import { findSimilarTitles } from "../../utils/helper";
import { MediaTitle } from "../anilist/anilist.types";
import { extractHianimeBySearch, extractHianimeDataId, extractHianimeEpisodesById, extractHianimeServersByEpisodeId } from "./hianime.extractor";
import { fetchHianimeBySearch, fetchHianimeEpisodesById, fetchHianimeIframeHtml, fetchHianimeRawSources, fetchHianimeServersByEpisodeId } from "./hianime.fetch";

export async function getHianimeMapper({ title }: { title: MediaTitle }) {
  const searchResults = await getHianimeBySearch({ title });
  if (!searchResults.length) return { id: null };

  // Get results for both English and Romaji
  const englishResults = findSimilarTitles({
    inputTitle: title.english!,
    titles: searchResults,
    type: "english",
  });

  const romajiResults = findSimilarTitles({
    inputTitle: title.romaji!,
    titles: searchResults,
    type: "romaji",
  });

  // Combine and keep only the best match for each ID
  const allResults = [...englishResults, ...romajiResults];
  const bestMatches = new Map();

  allResults.forEach((item) => {
    const current = bestMatches.get(item.id);
    if (!current || item.similarity > current.similarity) {
      bestMatches.set(item.id, item);
    }
  });

  const finalResults = Array.from(bestMatches.values())
    .sort((a, b) => b.similarity - a.similarity);

  return { id: finalResults[0]?.id ?? null };
}

export async function getHianimeBySearch({ title }: { title: MediaTitle }) {
  const raw = await fetchHianimeBySearch({ title, page: 1 });
  const data = await extractHianimeBySearch({ data: raw });
  
  return data;
}

export async function getHianimeEpisodesById({ id }: { id: string }) {
  const raw = await fetchHianimeEpisodesById({ id });
  const data = await extractHianimeEpisodesById({ data: raw });
  
  return data;
}

export async function getHianimeServersByEpisodeId({ id }: { id: string }) {
  const raw = await fetchHianimeServersByEpisodeId({ id });
  const data = await extractHianimeServersByEpisodeId({ data: raw });
  
  return data;
}

export async function getHianimeSource({ episodeId, server, type }: { episodeId: string, server: string, type: "sub" | "dub" }) {
  try {
    const iframeData = await fetchHianimeIframeHtml({ episodeId, server, type });
    const { dataId, fallbackServer, iframeUrl } = await extractHianimeDataId(iframeData);
    const sourcesData = await fetchHianimeRawSources({ dataId, fallbackServer });

    return {
      id: episodeId,
      type,
      link: {
        file: sourcesData?.sources?.file ?? "",
        type: "hls",
      },
      tracks: sourcesData?.tracks ?? [],
      intro: sourcesData?.intro ?? null,
      outro: sourcesData?.outro ?? null,
      iframe: iframeUrl,
      server,
    };
  } catch (error) {
    console.error(`getHianimeSource error for episode ${episodeId}:`, (error as Error).message);
    return null;
  }
}