const BASE_URL = 'https://yumaapi.vercel.app/';

export async function fetchYumaapiById({ id }: { id: string }) {
  try {
    const URL = `${BASE_URL}/info/${id}`
    const response = await fetch(URL);
    
    return response.json();
  } catch (error) {
    throw new Error((error as Error).message)
  }
}

export async function fetchYumaapiSourcesByEpsId({ epsId }: { epsId: string }) {
  try {
    const URL = `${BASE_URL}/watch?episodeId=${epsId}`
    const response = await fetch(URL);
    
    return response.json();
  } catch (error) {
    throw new Error((error as Error).message)
  }
}