import { findSimilarTitles } from "../../utils/helper";
import { MediaFormat } from "../anilist/anilist.enums";
import { MediaTitle } from "../anilist/anilist.types";
import { decryptHianimeData } from "./hianime.decryptor";
import { extractHianimeBySearch, extractHianimeEpisodesById, extractHianimeServersByEpisodeId } from "./hianime.extractor";
import { fetchHianimeBySearch, fetchHianimeEpisodesById, fetchHianimeServersByEpisodeId } from "./hianime.fetch";

export async function getHianimeMapper({ title, format }: { title: MediaTitle, format: MediaFormat }) {
  const searchResults = await getHianimeBySearch({ title });
  if (!searchResults.length) return { id: null };

  // Filter results by format
  const filteredResults = searchResults.filter(result => {
    if (!result.format) return true; // Keep if no format info
    return result.format.toLowerCase() === format.toLowerCase();
  });

  // Get results for both English and Romaji
  const englishResults = title.english ? findSimilarTitles({
    inputTitle: title.english,
    titles: filteredResults,
    type: "english",
  }) : [];

  const romajiResults = title.romaji ? findSimilarTitles({
    inputTitle: title.romaji,
    titles: filteredResults,
    type: "romaji",
  }) : [];

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
  const epsId = id.split('ep=')[1];
  const raw = await fetchHianimeServersByEpisodeId({ id: epsId });
  const data = await extractHianimeServersByEpisodeId({ data: raw });
  
  return data;
}

export async function getHianimeSource({ id, server, type }: { id: string, server: string, type: "sub" | "dub" }) {
  try {
    // Servers
    const servers = await getHianimeServersByEpisodeId({ id })
    let requestedServer = servers.filter(
      (n) =>
        n.serverName.toLowerCase() === server.toLowerCase() &&
        n.type.toLowerCase() === type.toLowerCase()
    );
    if (requestedServer.length === 0) {
      requestedServer = servers.filter(
        (n) =>
          n.serverName.toLowerCase() === server.toLowerCase() &&
          n.type.toLowerCase() === "raw"
      );
    }
    if (requestedServer.length === 0) {
      throw new Error(
        `No matching server found for name: ${name}, type: ${type}`
      );
    }

    // Stream Link
    const epsId = id.split('ep=')[1];
    const streamingLink = await decryptHianimeData({ 
      epId: id, 
      id: requestedServer[0].data_id,
      server,
      type,
      fallback: false
    });
    
    return { streamingLink, servers };
  } catch (error) {
    console.error(`getHianimeSource error for episode ${id}:`, (error as Error).message);
    return null;
  }
}