import type { PlayerStat, ScoreboardData } from "@/lib/types";

export function getGamesPlayed(player: PlayerStat): number {
  return player.wins + player.losses + player.ties;
}

export function getPlayerPoints(player: PlayerStat, winPoints: number, tiePoints: number): number {
  return player.wins * winPoints + player.ties * tiePoints;
}

export function getTotalGames(players: PlayerStat[]): number {
  return players.reduce((total, player) => total + getGamesPlayed(player), 0);
}

export function getTotalPoints(scoreboard: ScoreboardData): number {
  return scoreboard.players.reduce(
    (total, player) => total + getPlayerPoints(player, scoreboard.winPoints, scoreboard.tiePoints),
    0,
  );
}

export function formatPoints(value: number): string {
  return Number.isInteger(value) ? `${value}` : value.toFixed(2).replace(/\.00$/, "").replace(/0$/, "");
}
