import { MediaTitle } from "../anilist/anilist.types";
import { extractHianimeBySearch } from "./hianime.extractor";
import { fetchHianimeBySearch } from "./hianime.fetch";

async function getHianimeBySearch({ title }: { title: MediaTitle }) {
  const response = await fetchHianimeBySearch({ title, page: 1 });
  const data = await extractHianimeBySearch({ data: response });
  
  return data;
}