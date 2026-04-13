type SaveBarProps = {
  isDirty: boolean;
  isSaving: boolean;
  statusMessage: string;
  onSave: () => void;
  onReload: () => void;
  onReset: () => void;
};

export function SaveBar({ isDirty, isSaving, statusMessage, onSave, onReload, onReset }: SaveBarProps) {
  return (
    <section className="card save-card" aria-label="Save controls">
      <div>
        <h2>Save</h2>
        <p>{statusMessage}</p>
      </div>
      <div className="save-actions">
        <button type="button" className="action secondary" onClick={onReload} disabled={isSaving}>
          Reload
        </button>
        <button type="button" className="action secondary" onClick={onReset} disabled={isSaving}>
          Reset
        </button>
        <button type="button" className="action primary" onClick={onSave} disabled={!isDirty || isSaving}>
          {isSaving ? "Saving..." : "Save"}
        </button>
      </div>
    </section>
  );
}
