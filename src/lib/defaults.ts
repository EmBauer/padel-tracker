import type { ScoreboardData } from "@/lib/types";

const defaultNames = ["Sven", "Viola", "Simon", "Joni", "Lucca", "Matty"];

export function createDefaultScoreboard(): ScoreboardData {
  return {
    winPoints: 1,
    tiePoints: 0.5,
    version: 1,
    updatedAt: new Date().toISOString(),
    players: defaultNames.map((name, index) => ({
      id: `p${index + 1}`,
      name,
      wins: 0,
      losses: 0,
      ties: 0,
      lastOutcome: null,
    })),
  };
}
