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
  const results: { id: string; similarity: number }[] = [];

  // Clean the input title once
  const cleanInput = cleanTitle(inputTitle);

  titles.forEach((item) => {
    let targetTitle = "";
    if (type === "english") targetTitle = item.title.english || "";
    else targetTitle = item.title.romaji || "";

    if (!targetTitle) return;

    const cleanTarget = cleanTitle(targetTitle);
    const similarity = calculateSimilarity(cleanInput, cleanTarget);

    if (similarity > 0.6) {
      results.push({ id: item.id!, similarity });
    }
  });

  return results.sort((a, b) => b.similarity - a.similarity);
}

function cleanTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[&+]/g, " and ")
    .replace(/[-:]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function calculateSimilarity(input: string, target: string): number {
  // Get base titles without numbers
  const baseInput = input.replace(/\s*\d+$/, "").trim();
  const baseTarget = target.replace(/\s*\d+$/, "").trim();

  // Calculate base similarity
  const baseSimilarity = compareTwoStrings(baseInput, baseTarget);
  
  // If base titles don't match well, return low score
  if (baseSimilarity < 0.7) return baseSimilarity;

  // Check if numbers match
  const inputNum = input.match(/\d+$/)?.[0];
  const targetNum = target.match(/\d+$/)?.[0];

  // Case 1: Both have same number = highest score
  if (inputNum && targetNum && inputNum === targetNum) {
    return 0.95; // Almost perfect match
  }

  // Case 2: Input has number, target doesn't = assume target is season 1
  if (inputNum && !targetNum) {
    return inputNum === "1" ? 0.9 : 0.7;
  }

  // Case 3: Target has number, input doesn't = assume input is season 1
  if (!inputNum && targetNum) {
    return targetNum === "1" ? 0.9 : 0.7;
  }

  // Case 4: Both have different numbers = lower score
  if (inputNum && targetNum && inputNum !== targetNum) {
    return 0.65; // Still similar but different seasons
  }

  // Case 5: No numbers = good match
  return Math.min(0.9, baseSimilarity + 0.1);
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