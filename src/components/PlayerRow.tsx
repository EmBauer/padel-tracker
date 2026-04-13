import Image from "next/image";

import type { Outcome, PlayerStat } from "@/lib/types";
import { formatPoints, getGamesPlayed, getPlayerPoints } from "@/lib/scoring";

type PlayerRowProps = {
  player: PlayerStat;
  winPoints: number;
  tiePoints: number;
  onResult: (playerId: string, outcome: Outcome) => void;
  onUndo: (playerId: string) => void;
};

export function PlayerRow({ player, winPoints, tiePoints, onResult, onUndo }: PlayerRowProps) {
  const iconPath = `/players/${player.id}.png`;
  const initials = player.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <tr>
      <td>
        <div className="player-name-cell">
          <div className="player-avatar" aria-hidden="true">
            <Image
              src={iconPath}
              alt={`${player.name} avatar`}
              width={52}
              height={52}
              loading="lazy"
              onError={(event) => {
                event.currentTarget.style.display = "none";
                const fallback = event.currentTarget.nextElementSibling as HTMLSpanElement | null;
                if (fallback) {
                  fallback.style.display = "flex";
                }
              }}
            />
            <span className="player-avatar-fallback">{initials}</span>
          </div>
          <span>{player.name}</span>
        </div>
      </td>
      <td>{player.wins}</td>
      <td>{player.ties}</td>
      <td>{player.losses}</td>
      <td>{getGamesPlayed(player)}</td>
      <td>{formatPoints(getPlayerPoints(player, winPoints, tiePoints))}</td>
      <td>
        <div className="result-buttons">
          <button type="button" className="action win" onClick={() => onResult(player.id, "win")}>
            Win
          </button>
          <button type="button" className="action tie" onClick={() => onResult(player.id, "tie")}>
            Tie
          </button>
          <button type="button" className="action loss" onClick={() => onResult(player.id, "loss")}>
            Loss
          </button>
          <button
            type="button"
            className="action undo"
            onClick={() => onUndo(player.id)}
            disabled={!player.lastOutcome}
            title={player.lastOutcome ? `Undo ${player.lastOutcome}` : "No action to undo"}
          >
            ↶
          </button>
        </div>
      </td>
    </tr>
  );
}
