export type Outcome = "win" | "loss" | "tie";

export type PlayerStat = {
  id: string;
  name: string;
  wins: number;
  losses: number;
  ties: number;
};

export type ScoreboardData = {
  winPoints: number;
  tiePoints: number;
  players: PlayerStat[];
  version: number;
  updatedAt: string;
};

export type SaveScoreboardRequest = {
  scoreboard: ScoreboardData;
};

export type SaveScoreboardResponse =
  | { ok: true; scoreboard: ScoreboardData; storageMode: "redis" | "json" }
  | {
      ok: false;
      reason: "version_conflict" | "invalid_payload";
      message: string;
      scoreboard?: ScoreboardData;
    };
