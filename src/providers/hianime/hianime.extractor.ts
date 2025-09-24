import * as cheerio from "cheerio";
import { HianimeEpisodesResult, HianimeListResult } from "./hianime.types";

export async function extractHianimeBySearch({ data }: { data: string }) {
  if (!data) return []

  const $ = cheerio.load(data);
  
  const elements = "#main-content .film_list-wrap .flw-item";

  const result: HianimeListResult[] = [];
  $(elements).each((_, el) => {
    const id =
      $(el)
        .find(".film-detail .film-name .dynamic-name")
        ?.attr("href")
        ?.slice(1)
        .split("?ref=search")[0] || null;
    result.push({
      id: id,
      title: {
        romaji:
          $(el)
          .find(".film-detail .film-name .dynamic-name")
          ?.attr("data-jname")
          ?.trim() || null,
        english:
          $(el)
          .find(".film-detail .film-name .dynamic-name")
          ?.text()
          ?.trim() || null
      }
    });
  });

  return result
}

export async function extractHianimeEpisodesById({ data }: { data: { status: boolean, html: string } }) {
  if (!data.html) return []
  
  const $ = cheerio.load(String(data.html));

  const result: HianimeEpisodesResult  = {
    totalEpisodes: 0,
    episodes: [],
  };

  result.totalEpisodes = Number($(".detail-infor-content .ss-list a").length);

  $(".detail-infor-content .ss-list a").each((_, el) => {
    result.episodes.push({
      episode_no: Number($(el).attr("data-number")),
      id: $(el)?.attr("href")?.split("/")?.pop() || null,
      filler: $(el).hasClass("ssl-item-filler"),
    });
  });

  return result;
}

export async function extractHianimeServersByEpisodeId({ data }: { data: { status: boolean, html: string } }) {
  if (!data.html) return []

  const $ = cheerio.load(data.html);
  const result: any = [];
    $(".server-item").each((index, element) => {
      const data_id = $(element).attr("data-id");
      const server_id = $(element).attr("data-server-id");
      const type = $(element).attr("data-type");

      const serverName = $(element).find("a").text().trim();
      result.push({
        type,
        data_id,
        server_id,
        serverName,
      });
    });
    return result;
}