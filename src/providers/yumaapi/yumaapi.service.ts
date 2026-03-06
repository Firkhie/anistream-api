import { fetchYumaapiById, fetchYumaapiSourcesByEpsId } from "./yumaapi.fetch";
import { YumaapiEpisode, YumaapiEpisodesResult } from "./yumaapi.types";

export async function getYumaapiEpisodesById({ id }: { id: string }) {
  const raw = await fetchYumaapiById({ id });

  const data: YumaapiEpisode[] = raw.episodes.map((ep: any) => ({
    id: ep.id,
    episode_no: ep.number,
    filler: ep.is_filler,
  }));

  return {
    episodes: data,
    totalEpisodes: data.length
  } as YumaapiEpisodesResult;
}

export async function getYumaapiSource({ id, type = "sub" }: { id: string, type?: "sub" | "dub" }) {
  try {
    const data = await fetchYumaapiSourcesByEpsId({ epsId: id });

    const source =
      data?.sources?.find((s: any) => s.isM3U8) ||
      data?.sources?.[0];

    const tracks = [
      ...(data?.subtitles || []).map((s: any, i: number) => ({
        file: s.url,
        label: s.lang,
        kind: "captions",
        default: i === 0,
      })),
      ...(data?.previews || []).map((p: any) => ({
        file: p.url,
        kind: "thumbnails",
      })),
    ];

    const streamingLink = {
      id,
      type,
      link: {
        file: source?.url || "",
        type: source?.isM3U8 ? "hls" : "mp4",
      },
      tracks,
      intro: data?.intro || { start: 0, end: 0 },
      outro: data?.outro || { start: 0, end: 0 },
      iframe: data?.headers?.Referer || null,
      server: "yumaapi",
    };

    return {
      streamingLink,
      servers: [],
    };
  } catch (error) {
    console.error(
      `getYumaapiSource error for episode ${id}:`,
      (error as Error).message
    );
    return null;
  }
}