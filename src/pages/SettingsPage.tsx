import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { soundEngine } from "../services/soundEngine";
import s from "./SecondaryPage.module.css";

interface Settings {
  botDifficulty: "easy" | "medium" | "hard";
  playerColor: "white" | "black" | "random";
  animations: boolean;
  narrativeEvents: boolean;
  showCoordinates: boolean;
  sounds: boolean;
  soundVolume: number;
}

const DEFAULTS: Settings = {
  botDifficulty: "medium",
  playerColor: "white",
  animations: true,
  narrativeEvents: true,
  showCoordinates: true,
  sounds: true,
  soundVolume: 0.6,
};

function loadSettings(): Settings {
  try { return { ...DEFAULTS, ...JSON.parse(localStorage.getItem("chess_settings") ?? "{}") }; }
  catch { return DEFAULTS; }
}

export function SettingsPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [settings, setSettings] = useState<Settings>(loadSettings);
  const [saved, setSaved] = useState(false);

  function update<K extends keyof Settings>(key: K, value: Settings[K]) {
    setSettings(prev => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  function save() {
    localStorage.setItem("chess_settings", JSON.stringify(settings));
    soundEngine.setEnabled(settings.sounds);
    soundEngine.setVolume(settings.soundVolume);
    if (settings.sounds) soundEngine.play("uiClick");
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const difficultyInfo = {
    easy:   { label: "ЛЕГКО",   sub: "Глубина 1 · Для новичков",   color: "#4caf50" },
    medium: { label: "СРЕДНЕ",  sub: "Глубина 3 · Честный бой",    color: "#FFEE00" },
    hard:   { label: "СЛОЖНО",  sub: "Глубина 4 · Опытный оппонент", color: "#FF2D78" },
  };

  return (
    <div className={s.page}>
      <header className={s.header}>
        <button className={s.backBtn} onClick={() => navigate("/")}>← НАЗАД</button>
        <h1 className={s.pageTitle}>НАСТРОЙКИ</h1>
        <div />
      </header>

      <main className={s.main} style={{ maxWidth: 560 }}>

        {/* Account */}
        <section className={s.settingSection}>
          <h2 className={s.sectionLabel}>АККАУНТ</h2>
          <div className={s.accountBlock}>
            <div className={s.accountInfo}>
              <span className={s.accountUsername}>{user?.username}</span>
              <span className={s.accountMeta}>
                {user?.faction === "aurora" ? "АВРОРА" : "НОВА"} · ЭЛО {user?.rating}
              </span>
            </div>
            <button className={s.dangerBtn} onClick={logout}>ВЫЙТИ</button>
          </div>
        </section>

        {/* Bot difficulty */}
        <section className={s.settingSection}>
          <h2 className={s.sectionLabel}>СЛОЖНОСТЬ БОТА</h2>
          <div className={s.optionRow}>
            {(["easy", "medium", "hard"] as const).map(d => {
              const info = difficultyInfo[d];
              return (
                <button
                  key={d}
                  className={`${s.optionBtn} ${settings.botDifficulty === d ? s.optionBtnActive : ""}`}
                  style={{ "--opt": info.color } as React.CSSProperties}
                  onClick={() => update("botDifficulty", d)}
                >
                  <span className={s.optionLabel}>{info.label}</span>
                  <span className={s.optionSub}>{info.sub}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Player color */}
        <section className={s.settingSection}>
          <h2 className={s.sectionLabel}>ИГРАТЬ ЗА</h2>
          <div className={s.optionRow}>
            {([
              { val: "white",  label: "БЕЛЫЕ",   sub: "Аврора · Ход первым", color: "#4A90D9" },
              { val: "black",  label: "ЧЁРНЫЕ",  sub: "Нова · Ход вторым",  color: "#FF2D78" },
              { val: "random", label: "СЛУЧАЙНО", sub: "Определится при старте", color: "#888" },
            ] as const).map(({ val, label, sub, color }) => (
              <button
                key={val}
                className={`${s.optionBtn} ${settings.playerColor === val ? s.optionBtnActive : ""}`}
                style={{ "--opt": color } as React.CSSProperties}
                onClick={() => update("playerColor", val)}
              >
                <span className={s.optionLabel}>{label}</span>
                <span className={s.optionSub}>{sub}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Sound section */}
        <section className={s.settingSection}>
          <h2 className={s.sectionLabel}>ЗВУК</h2>
          <div className={s.toggleList}>
            <div className={s.toggleRow}>
              <div className={s.toggleInfo}>
                <span className={s.toggleLabel}>Звуковые эффекты</span>
                <span className={s.toggleSub}>Звуки ходов, взятий, шаха и событий</span>
              </div>
              <button
                className={`${s.toggle} ${settings.sounds ? s.toggleOn : ""}`}
                onClick={() => update("sounds", !settings.sounds)}
              >
                <span className={s.toggleKnob} />
              </button>
            </div>
          </div>

          {settings.sounds && (
            <div style={{ padding: "12px 14px", background: "#0f0f1a", border: "1px solid #111", borderTop: "none", display: "flex", flexDirection: "column", gap: 8 }}>
              <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 11, color: "#555", letterSpacing: "0.1em" }}>
                ГРОМКОСТЬ
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <input
                  type="range" min="0" max="1" step="0.05"
                  value={settings.soundVolume}
                  onChange={e => update("soundVolume", Number(e.target.value))}
                  style={{ flex: 1, accentColor: "#4A90D9" }}
                />
                <span style={{ fontFamily: "'Bangers', cursive", fontSize: 18, color: "#4A90D9", minWidth: 36 }}>
                  {Math.round(settings.soundVolume * 100)}
                </span>
              </div>
              <button
                style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 11, padding: "6px 12px", background: "#111", border: "1px solid #333", color: "#666", cursor: "pointer", width: "fit-content" }}
                onClick={() => { soundEngine.setVolume(settings.soundVolume); soundEngine.setEnabled(true); soundEngine.play("move"); }}
              >
                ▶ ТЕСТ ЗВУКА
              </button>
            </div>
          )}
        </section>

        {/* Toggles */}
        <section className={s.settingSection}>
          <h2 className={s.sectionLabel}>ИНТЕРФЕЙС</h2>
          <div className={s.toggleList}>
            {([
              { key: "animations",      label: "Анимации",              sub: "Плавные переходы и эффекты" },
              { key: "narrativeEvents", label: "Сюжетные панели",       sub: "Комикс-сцены во время партии" },
              { key: "showCoordinates", label: "Координаты доски",      sub: "Буквы и цифры на краях" },
            ] as const).map(({ key, label, sub }) => (
              <div key={key} className={s.toggleRow}>
                <div className={s.toggleInfo}>
                  <span className={s.toggleLabel}>{label}</span>
                  <span className={s.toggleSub}>{sub}</span>
                </div>
                <button
                  className={`${s.toggle} ${settings[key] ? s.toggleOn : ""}`}
                  onClick={() => update(key, !settings[key])}
                  aria-label={label}
                >
                  <span className={s.toggleKnob} />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Save */}
        <button
          className={s.saveBtn}
          onClick={save}
          style={{ "--c": saved ? "#4caf50" : "#FFEE00" } as React.CSSProperties}
        >
          {saved ? "✓ СОХРАНЕНО" : "СОХРАНИТЬ"}
        </button>
      </main>
    </div>
  );
}
