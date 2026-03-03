import * as cheerio from "cheerio";

const FALLBACK_1 = "megaplay.buzz";
const FALLBACK_2 = "vidwish.live";
const V1_BASE_URL = "https://hianime.to"; // ganti sesuai kebutuhan

type DecryptParams = {
  epId: string;
  id: string;
  server: string;
  type: "sub" | "dub";
  fallback: boolean;
};

type DecryptedResult = {
  id: string;
  type: "sub" | "dub";
  link: {
    file: string;
    type: "hls";
  };
  tracks: any[];
  intro: string | null;
  outro: string | null;
  iframe: string | null;
  server: string;
};

export async function decryptHianimeData({
  epId,
  id,
  server,
  type,
  fallback,
}: DecryptParams): Promise<DecryptedResult | null> {
  try {
    let decryptedSources: any = null;
    let iframeURL: string | null = null;

    if (fallback) {
      // Tentukan fallback server
      const fallbackServer = ["hd-1", "hd-3"].includes(server.toLowerCase())
        ? FALLBACK_1
        : FALLBACK_2;

      iframeURL = `https://${fallbackServer}/stream/s-2/${epId}/${type}`;

      // Ambil halaman HTML
      const response = await fetch(iframeURL, {
        headers: { Referer: `https://${fallbackServer}/` },
      });
      const html = await response.text();
      const $ = cheerio.load(html);

      // Ambil data-id player
      const dataId = $("#megaplay-player").attr("data-id");
      if (!dataId) throw new Error("Missing data-id");

      // Ambil sources JSON
      const sourceResponse = await fetch(
        `https://${fallbackServer}/stream/getSources?id=${dataId}`,
        {
          headers: { "X-Requested-With": "XMLHttpRequest" },
        }
      );
      decryptedSources = await sourceResponse.json();
    } else {
      // Ambil sources dari v1
      const response = await fetch(
        `${V1_BASE_URL}/ajax/v2/episode/sources?id=${id}`
      );
      const sourcesData = await response.json();

      const ajaxLink = sourcesData?.link;
      if (!ajaxLink) throw new Error("Missing link in sourcesData");

      const sourceIdMatch = /\/([^/?]+)\?/.exec(ajaxLink);
      const sourceId = sourceIdMatch?.[1];
      if (!sourceId)
        throw new Error("Unable to extract sourceId from link");

      const embedUrl = `https://megacloud.blog/embed-2/v3/e-1/${sourceId}?k=1`;

      // Fetch POST request via fetch
      const postResponse = await fetch(
        "https://megacloud.zenime.site/get-sources",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ embedUrl }),
        }
      );
      decryptedSources = await postResponse.json();
    }

    if (!decryptedSources) throw new Error("Failed to decrypt sources");

    return {
      id,
      type,
      link: {
        file: fallback
          ? decryptedSources?.sources?.file ?? ""
          : decryptedSources?.sources?.[0]?.file ?? "",
        type: "hls",
      },
      tracks: decryptedSources?.tracks ?? [],
      intro: decryptedSources?.intro ?? null,
      outro: decryptedSources?.outro ?? null,
      iframe: iframeURL,
      server,
    };
  } catch (error: any) {
    console.error(
      `Error decryptHianimeData(id=${id}, epId=${epId}, server=${server}):`,
      error?.message || error
    );
    return null;
  }
}