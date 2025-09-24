import { findSimilarTitles } from "../../utils/helper";
import { MediaTitle } from "../anilist/anilist.types";
import { extractHianimeBySearch, extractHianimeEpisodesById, extractHianimeServersByEpisodeId } from "./hianime.extractor";
import { fetchHianimeBySearch, fetchHianimeEpisodesById, fetchHianimeServersByEpisodeId } from "./hianime.fetch";

export async function getHianimeMapper({ title }: { title: MediaTitle }) {
  const searchResults = await getHianimeBySearch({ title })
  if (!searchResults.length) return { id: null };

  const mapped = [
    ...findSimilarTitles({
      inputTitle: title.english!,
      titles: searchResults,
      type: "english",
    }),
    ...findSimilarTitles({
      inputTitle: title.romaji!,
      titles: searchResults,
      type: "romaji",
    }),
  ];

  const uniqueResults = Array.from(
    new Set(mapped.map((item) => JSON.stringify(item)))
  ).map((str) => JSON.parse(str));

  uniqueResults.sort((a, b) => (b.similarity || 0) - (a.similarity || 0));

  return { id: uniqueResults[0].id ?? null }
}

export async function getHianimeBySearch({ title }: { title: MediaTitle }) {
  const response = await fetchHianimeBySearch({ title, page: 1 });
  const data = await extractHianimeBySearch({ data: response });
  
  return data;
}

export async function getHianimeEpisodesById({ id }: { id: string }) {
  const response = await fetchHianimeEpisodesById({ id });
  const data = await extractHianimeEpisodesById({ data: response });
  
  return data;
}

export async function getHianimeServersByEpisodeId({ id }: { id: string }) {
  const response = await fetchHianimeServersByEpisodeId({ id });
  const data = await extractHianimeServersByEpisodeId({ data: response });
  
  return data;
}