import { NextResponse } from "next/server";

import { loadScoreboard, saveScoreboard } from "@/lib/storage";
import type { SaveScoreboardRequest, SaveScoreboardResponse, ScoreboardData } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isValidScoreboard(value: unknown): value is ScoreboardData {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<ScoreboardData>;

  if (typeof candidate.winPoints !== "number" || Number.isNaN(candidate.winPoints) || candidate.winPoints < 0) {
    return false;
  }

  if (typeof candidate.tiePoints !== "number" || Number.isNaN(candidate.tiePoints) || candidate.tiePoints < 0) {
    return false;
  }

  if (typeof candidate.version !== "number" || Number.isNaN(candidate.version) || candidate.version < 1) {
    return false;
  }

  if (!Array.isArray(candidate.players) || candidate.players.length !== 6) {
    return false;
  }

  return candidate.players.every((player) => {
    return (
      typeof player.id === "string" &&
      typeof player.name === "string" &&
      typeof player.wins === "number" &&
      player.wins >= 0 &&
      typeof player.losses === "number" &&
      player.losses >= 0 &&
      typeof player.ties === "number" &&
      player.ties >= 0
    );
  });
}

export async function GET() {
  const { scoreboard, storageMode } = await loadScoreboard();
  return NextResponse.json({ ok: true, scoreboard, storageMode });
}

export async function PUT(request: Request) {
  const body = (await request.json()) as SaveScoreboardRequest;

  if (!body?.scoreboard || !isValidScoreboard(body.scoreboard)) {
    const invalidResponse: SaveScoreboardResponse = {
      ok: false,
      reason: "invalid_payload",
      message: "The submitted scoreboard payload is invalid.",
    };
    return NextResponse.json(invalidResponse, { status: 400 });
  }

  const current = await loadScoreboard();
  if (body.scoreboard.version !== current.scoreboard.version) {
    const conflictResponse: SaveScoreboardResponse = {
      ok: false,
      reason: "version_conflict",
      message: "Another user saved newer data. Reload before saving again.",
      scoreboard: current.scoreboard,
    };
    return NextResponse.json(conflictResponse, { status: 409 });
  }

  const updated: ScoreboardData = {
    ...body.scoreboard,
    version: body.scoreboard.version + 1,
    updatedAt: new Date().toISOString(),
  };

  const saved = await saveScoreboard(updated);

  const successResponse: SaveScoreboardResponse = {
    ok: true,
    scoreboard: saved.scoreboard,
    storageMode: saved.storageMode,
  };

  return NextResponse.json(successResponse, { status: 200 });
}
