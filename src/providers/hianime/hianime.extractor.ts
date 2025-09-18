import * as cheerio from "cheerio";

export async function extractHianimeBySearch({ data }: { data: string }) {
  const $ = cheerio.load(data);
  
  const elements = "#main-content .film_list-wrap .flw-item";

  const result: any = [];
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