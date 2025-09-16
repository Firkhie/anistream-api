const BASE_URL = 'https://graphql.anilist.co';

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
    return await response.json();
  } catch (error) {
    throw new Error((error as Error).message)
  }
}