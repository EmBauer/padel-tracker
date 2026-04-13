"use client";

import { useEffect, useMemo, useState } from "react";

import { PlayerRow } from "@/components/PlayerRow";
import { SaveBar } from "@/components/SaveBar";
import { SettingsPanel } from "@/components/SettingsPanel";
import { createDefaultScoreboard } from "@/lib/defaults";
import { formatPoints, getTotalGames, getTotalPoints } from "@/lib/scoring";
import type { Outcome, SaveScoreboardResponse, ScoreboardData } from "@/lib/types";

type LoadResponse = {
  ok: boolean;
  scoreboard: ScoreboardData;
  storageMode: "redis" | "json";
};

function applyOutcome(scoreboard: ScoreboardData, playerId: string, outcome: Outcome): ScoreboardData {
  return {
    ...scoreboard,
    players: scoreboard.players.map((player) => {
      if (player.id !== playerId) {
        return player;
      }

      if (outcome === "win") {
        return { ...player, wins: player.wins + 1 };
      }

      if (outcome === "tie") {
        return { ...player, ties: player.ties + 1 };
      }

      return { ...player, losses: player.losses + 1 };
    }),
  };
}

function makeResetState(scoreboard: ScoreboardData): ScoreboardData {
  const defaults = createDefaultScoreboard();
  return {
    ...defaults,
    version: scoreboard.version,
    players: scoreboard.players.map((player) => ({
      ...player,
      wins: 0,
      ties: 0,
      losses: 0,
    })),
  };
}

export default function Home() {
  const [remote, setRemote] = useState<ScoreboardData | null>(null);
  const [draft, setDraft] = useState<ScoreboardData | null>(null);
  const [storageMode, setStorageMode] = useState<"redis" | "json" | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState("Loading scoreboard...");

  const isDirty = useMemo(() => {
    if (!remote || !draft) {
      return false;
    }
    return JSON.stringify(remote) !== JSON.stringify(draft);
  }, [draft, remote]);

  const totalGames = useMemo(() => (draft ? getTotalGames(draft.players) : 0), [draft]);
  const totalPoints = useMemo(() => (draft ? getTotalPoints(draft) : 0), [draft]);

  async function loadScoreboard() {
    setIsLoading(true);
    setStatusMessage("Loading scoreboard...");
    try {
      const response = await fetch("/api/scoreboard", { cache: "no-store" });
      const body = (await response.json()) as LoadResponse;

      if (!response.ok || !body.ok) {
        throw new Error("Could not load scoreboard.");
      }

      setRemote(body.scoreboard);
      setDraft(body.scoreboard);
      setStorageMode(body.storageMode);
      setStatusMessage(`Loaded (${body.storageMode === "redis" ? "shared" : "json-file"} mode).`);
    } catch {
      const fallback = createDefaultScoreboard();
      setRemote(fallback);
      setDraft(fallback);
      setStorageMode(null);
      setStatusMessage("Load failed. Showing local fallback data.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadScoreboard();
  }, []);

  function handleOutcome(playerId: string, outcome: Outcome) {
    if (!draft) {
      return;
    }
    setDraft(applyOutcome(draft, playerId, outcome));
    setStatusMessage("Unsaved changes.");
  }

  function handleWinPointsChange(value: number) {
    if (!draft || Number.isNaN(value) || value < 0) {
      return;
    }
    setDraft({ ...draft, winPoints: value });
    setStatusMessage("Unsaved changes.");
  }

  function handleTiePointsChange(value: number) {
    if (!draft || Number.isNaN(value) || value < 0) {
      return;
    }
    setDraft({ ...draft, tiePoints: value });
    setStatusMessage("Unsaved changes.");
  }

  async function handleSave() {
    if (!draft) {
      return;
    }

    setIsSaving(true);
    setStatusMessage("Saving scoreboard...");

    try {
      const response = await fetch("/api/scoreboard", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scoreboard: draft }),
      });

      const body = (await response.json()) as SaveScoreboardResponse;

      if (!body.ok) {
        if (body.reason === "version_conflict" && body.scoreboard) {
          setRemote(body.scoreboard);
          setDraft(body.scoreboard);
          setStatusMessage("Save conflict detected. Latest data has been reloaded.");
          return;
        }

        throw new Error(body.message || "Save failed.");
      }

      if (!response.ok) {
        throw new Error("Save failed.");
      }

      setRemote(body.scoreboard);
      setDraft(body.scoreboard);
      setStorageMode(body.storageMode);
      setStatusMessage(`Saved at ${new Date(body.scoreboard.updatedAt).toLocaleTimeString()}.`);
    } catch {
      setStatusMessage("Save failed. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  function handleReset() {
    if (!draft) {
      return;
    }

    const confirmed = window.confirm("Reset all stats in the current draft? You can still click Save to persist this.");
    if (!confirmed) {
      return;
    }

    setDraft(makeResetState(draft));
    setStatusMessage("Draft reset. Click Save to persist.");
  }

  if (!draft) {
    return <main className="page-shell">Unable to initialize scoreboard.</main>;
  }

  return (
    <main className="page-shell">
      <div className="hero">
        <p className="kicker">PADEL BOOTCAMP TRACKER</p>
        <h1>Padel World Championship</h1>
        <p>
          The hunt for the ultimate padel trophy!
        </p>
      </div>

      <section className="stats-strip">
        <article className="stat-card">
          <span>Total games</span>
          <strong>{totalGames}</strong>
        </article>
        <article className="stat-card">
          <span>Total points</span>
          <strong>{formatPoints(totalPoints)}</strong>
        </article>
        <article className="stat-card">
          <span>Storage mode</span>
          <strong>{storageMode === "redis" ? "Shared (Redis)" : "JSON file"}</strong>
        </article>
      </section>

      <SettingsPanel
        winPoints={draft.winPoints}
        tiePoints={draft.tiePoints}
        onWinPointsChange={handleWinPointsChange}
        onTiePointsChange={handleTiePointsChange}
      />

      <section className="card table-card" aria-label="Players and scores">
        <div className="table-header">
          <h2>Players</h2>
          <p>{isLoading ? "Refreshing..." : "Ready"}</p>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Player</th>
                <th>Wins</th>
                <th>Ties</th>
                <th>Losses</th>
                <th>Games</th>
                <th>Points</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {draft.players.map((player) => (
                <PlayerRow
                  key={player.id}
                  player={player}
                  winPoints={draft.winPoints}
                  tiePoints={draft.tiePoints}
                  onResult={handleOutcome}
                />
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <SaveBar
        isDirty={isDirty}
        isSaving={isSaving}
        statusMessage={statusMessage}
        onSave={handleSave}
        onReload={loadScoreboard}
        onReset={handleReset}
      />
    </main>
  );
}
