const BASE_URL = 'https://graphql.anilist.co';
const ANILIST_IDS_URL = 'https://raw.githubusercontent.com/5H4D0WILA/IDFetch/main/ids.txt'

export async function fetchAnilist({ query, variables }: any) {
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ query, variables })
  }
  try {
    const response = await fetch(BASE_URL, options);
    return response.json();
  } catch (error) {
    throw new Error((error as Error).message)
  }
}

export async function fetchAnilistIds() {
  try {
    const response = await fetch(ANILIST_IDS_URL);
    return response.text();
  } catch (error) {
    throw new Error((error as Error).message)
  }
}