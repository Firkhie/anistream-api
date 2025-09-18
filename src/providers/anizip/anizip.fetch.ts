const BASE_URL = 'https://api.ani.zip'

export async function fetchAnizipEpisodesById({ id }: { id: string }) {
  try {
    const URL = `${BASE_URL}/mappings?anilist_id=${id}`
    const response = await fetch(URL);
    return response.json();
  } catch (error) {
    throw new Error((error as Error).message)
  }
}