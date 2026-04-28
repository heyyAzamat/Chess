import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import s from "./AuthPage.module.css";

type Mode = "login" | "register";

export function AuthPage() {
  const [mode, setMode]           = useState<Mode>("login");
  const [username, setUsername]   = useState("");
  const [password, setPassword]   = useState("");
  const [faction, setFaction]     = useState<"aurora" | "nova">("aurora");
  const [error, setError]         = useState<string | null>(null);
  const [loading, setLoading]     = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const err =
      mode === "login"
        ? await login(username, password)
        : await register(username, password, faction);

    setLoading(false);
    if (err) { setError(err); return; }
    navigate("/");
  }

  function switchMode(m: Mode) {
    setMode(m);
    setError(null);
  }

  return (
    <div className={s.page}>
      <div className={s.bg} />

      {/* Left panel — lore */}
      <div className={s.lore}>
        <p className={s.loreYear}>2187 · ПОСЛЕДНИЙ ГОРОД</p>
        <h1 className={s.loreTitle}>ЭДЕМ-ЗЕРО</h1>
        <p className={s.loreSub}>Протокол Войны</p>
        <div className={s.loreDivider} />
        <p className={s.loreText}>
          Оракул держит Эдем-0 в равновесии. Две силы оспаривают его контроль.
          Войди в систему — и выбери свою сторону в войне, которая решит судьбу
          последнего города человечества.
        </p>
        <div className={s.loreFactions}>
          <div className={s.loreFaction} style={{ color: "#4A90D9" }}>
            <span className={s.loreFactionName}>АВРОРА</span>
            <span className={s.loreFactionMotto}>Порядок — единственная свобода</span>
          </div>
          <span className={s.loreVs}>VS</span>
          <div className={s.loreFaction} style={{ color: "#FF2D78" }}>
            <span className={s.loreFactionName}>НОВА</span>
            <span className={s.loreFactionMotto}>Клетка из золота — всё равно клетка</span>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className={s.formPanel}>
        <div className={s.card}>
          {/* Mode toggle */}
          <div className={s.modeTabs}>
            <button
              className={`${s.modeTab} ${mode === "login" ? s.modeTabActive : ""}`}
              onClick={() => switchMode("login")}
            >
              ВОЙТИ
            </button>
            <button
              className={`${s.modeTab} ${mode === "register" ? s.modeTabActive : ""}`}
              onClick={() => switchMode("register")}
            >
              РЕГИСТРАЦИЯ
            </button>
          </div>

          <form className={s.form} onSubmit={handleSubmit}>
            <div className={s.field}>
              <label className={s.label}>ПОЗЫВНОЙ</label>
              <input
                className={s.input}
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="your_callsign"
                autoComplete="username"
                required
              />
            </div>

            <div className={s.field}>
              <label className={s.label}>ПАРОЛЬ</label>
              <input
                className={s.input}
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                required
              />
            </div>

            {/* Faction choice only on register */}
            {mode === "register" && (
              <div className={s.field}>
                <label className={s.label}>ВЫБЕРИ ФРАКЦИЮ</label>
                <div className={s.factionPicker}>
                  <button
                    type="button"
                    className={`${s.factionBtn} ${faction === "aurora" ? s.factionBtnActive : ""}`}
                    style={{ "--f": "#4A90D9" } as React.CSSProperties}
                    onClick={() => setFaction("aurora")}
                  >
                    <span className={s.factionBtnName}>АВРОРА</span>
                    <span className={s.factionBtnSub}>Порядок и контроль</span>
                  </button>
                  <button
                    type="button"
                    className={`${s.factionBtn} ${faction === "nova" ? s.factionBtnActive : ""}`}
                    style={{ "--f": "#FF2D78" } as React.CSSProperties}
                    onClick={() => setFaction("nova")}
                  >
                    <span className={s.factionBtnName}>НОВА</span>
                    <span className={s.factionBtnSub}>Свобода и хаос</span>
                  </button>
                </div>
              </div>
            )}

            {error && <p className={s.error}>{error}</p>}

            <button className={s.submitBtn} type="submit" disabled={loading}>
              {loading ? "ЗАГРУЗКА..." : mode === "login" ? "ВОЙТИ В СИСТЕМУ" : "СОЗДАТЬ АГЕНТА"}
            </button>
          </form>

          {mode === "login" && (
            <p className={s.hint}>
              Нет аккаунта?{" "}
              <button className={s.hintLink} onClick={() => switchMode("register")}>
                Зарегистрироваться
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
