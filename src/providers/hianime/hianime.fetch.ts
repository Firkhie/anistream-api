import { MediaTitle } from "../anilist/anilist.types";

const BASE_URL = 'https://hianime.do/';

export async function fetchHianimeBySearch({ title, page }: { title: MediaTitle, page: number }) {
  try {
    const query = title?.romaji || title?.english || title?.userPreferred || "";
    const options = {
      method: 'GET',
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      },
    }
    const URL = `${BASE_URL}/search?keyword=${query.replace(/[\W_]+/g, '+')}&page=${page}`
    const response = await fetch(URL, options);
    
    return response.text();
  } catch (error) {
    throw new Error((error as Error).message)
  }
}