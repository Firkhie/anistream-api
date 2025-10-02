import { compareTwoStrings } from 'string-similarity';
import { MediaSeason } from "../providers/anilist/anilist.enums";
import { MediaTitle } from "../providers/anilist/anilist.types";
import { HianimeListResult } from '../providers/hianime/hianime.types';
import { getHianimeServersByEpisodeId } from '../providers/hianime/hianime.service';

export function getSeason(): MediaSeason {
  const month = new Date().getMonth() + 1;

  if (month >= 1 && month <= 3) {
    return MediaSeason.WINTER;
  } else if (month >= 4 && month <= 6) {
    return MediaSeason.SPRING;
  } else if (month >= 7 && month <= 9) {
    return MediaSeason.SUMMER;
  } else {
    return MediaSeason.FALL;
  }
}

export function cleanQueries({ queries }: { queries: any }) {
  return Object.fromEntries(
    Object.entries(queries).filter(([_, v]) => v != null && v !== "" && !Number.isNaN(v))
  )
}

export function findSimilarTitles({
  inputTitle,
  titles,
  type,
}: {
  inputTitle: string;
  titles: { id: string; title: MediaTitle }[] | HianimeListResult[];
  type: "english" | "romaji";
}) {
  const results: { id: string, similarity: number }[] = [];
  
  titles.forEach((item) => {
    let cleanedTitle: string = ""
    
    if (type === "english") cleanedTitle = item.title.english || ""
    else cleanedTitle = item.title.romaji || ""
    
    if (!cleanedTitle.length) return;
    
    const similarity = compareTwoStrings(inputTitle.toLowerCase(), cleanedTitle.toLowerCase());
    if (similarity > 0.6) {
      results.push({ id: item.id!, similarity });
    }
  })

  return results.sort((a, b) => b.similarity - a.similarity);
}

export async function checkRequestedServers({ id, server, type }: { id: string, server: string, type: "sub" | "dub" }) {
  const servers = await getHianimeServersByEpisodeId({ id });

  let requestedServers = servers.filter((n) =>
    n.serverName.toLowerCase() === server.toLowerCase() && 
    n.type === type
  )
  
  if (requestedServers.length === 0) {
    requestedServers = servers.filter((n) => 
      n.serverName.toLowerCase() === server.toLowerCase() && 
      n.type === "raw"
    )
  }
  if (requestedServers.length === 0) {
    return false;
  }
  return true;
}