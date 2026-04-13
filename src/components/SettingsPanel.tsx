type SettingsPanelProps = {
  winPoints: number;
  tiePoints: number;
  onWinPointsChange: (value: number) => void;
  onTiePointsChange: (value: number) => void;
};

export function SettingsPanel({
  winPoints,
  tiePoints,
  onWinPointsChange,
  onTiePointsChange,
}: SettingsPanelProps) {
  return (
    <section className="card settings-card" aria-label="Scoring settings">
      <h2>Scoring</h2>
      <div className="settings-grid">
        <label>
          Win points
          <input
            type="number"
            min="0"
            step="0.1"
            value={winPoints}
            onChange={(event) => onWinPointsChange(Number(event.target.value))}
          />
        </label>
        <label>
          Tie points
          <input
            type="number"
            min="0"
            step="0.1"
            value={tiePoints}
            onChange={(event) => onTiePointsChange(Number(event.target.value))}
          />
        </label>
      </div>
    </section>
  );
}
