export const THEMES = [
  { key: 'light', label: 'Light' },
  { key: 'dark', label: 'Dark' },
  { key: 'ocean', label: 'Ocean' },
];

export default function Settings({ theme, onThemeChange }) {
  return (
    <div className="card">
      <div className="card-title">Settings</div>
      <div className="setting-row">
        <span>Theme</span>
        <select value={theme} onChange={(e) => onThemeChange(e.target.value)}>
          {THEMES.map((t) => (
            <option key={t.key} value={t.key}>{t.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
