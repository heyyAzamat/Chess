import { useState } from "react";
import { findUser } from "../../contexts/AuthContext";
import type { User } from "../../contexts/AuthContext";
import s from "./MultiplayerSetup.module.css";

export interface MultiplayerPlayers {
  p1: User;
  p2: User | null; // null = гость
  p2name: string;  // имя если гость
}

interface Props {
  p1: User;
  onStart: (players: MultiplayerPlayers) => void;
  onBack: () => void;
}

const F_COLOR = { aurora: "#4A90D9", nova: "#FF2D78" };
const F_LABEL = { aurora: "АВРОРА",  nova: "НОВА"    };

export function MultiplayerSetup({ p1, onStart, onBack }: Props) {
  const [p2input, setP2input] = useState("");
  const [found, setFound]     = useState<User | null | "guest">(null);
  const [error, setError]     = useState("");

  function search() {
    const name = p2input.trim();
    if (!name) return;
    if (name.toLowerCase() === p1.username.toLowerCase()) {
      setError("Нельзя играть против себя");
      setFound(null);
      return;
    }
    const user = findUser(name);
    if (user) {
      setFound(user);
      setError("");
    } else {
      setError(`Игрок «${name}» не найден`);
      setFound(null);
    }
  }

  function playAsGuest() {
    setFound("guest");
    setError("");
  }

  function handleStart() {
    const name = p2input.trim() || "Гость";
    if (found === "guest") {
      onStart({ p1, p2: null, p2name: name });
    } else if (found) {
      onStart({ p1, p2: found, p2name: found.username });
    }
  }

  return (
    <div className={s.overlay}>
      <div className={s.card}>
        <div className={s.bg} />

        <h2 className={s.title}>ЛОКАЛЬНЫЙ МУЛЬТИПЛЕЕР</h2>
        <p className={s.sub}>Два игрока · Одно устройство</p>

        <div className={s.players}>
          {/* Player 1 */}
          <div className={s.player}>
            <span className={s.playerLabel}>ИГРОК 1</span>
            <div
              className={s.avatar}
              style={{ background: F_COLOR[p1.faction], boxShadow: `0 0 14px ${F_COLOR[p1.faction]}` }}
            >
              {p1.avatar}
            </div>
            <span className={s.playerName}>{p1.username}</span>
            <span className={s.playerMeta} style={{ color: F_COLOR[p1.faction] }}>
              {F_LABEL[p1.faction]} · {p1.rating} ЭЛО
            </span>
            <span className={s.colorBadge} style={{ borderColor: "#4A90D9", color: "#4A90D9" }}>
              ♙ БЕЛЫЕ
            </span>
          </div>

          <div className={s.vsBlock}>
            <span className={s.vsText}>VS</span>
          </div>

          {/* Player 2 */}
          <div className={s.player}>
            <span className={s.playerLabel}>ИГРОК 2</span>

            {found && found !== "guest" ? (
              <>
                <div
                  className={s.avatar}
                  style={{ background: F_COLOR[found.faction], boxShadow: `0 0 14px ${F_COLOR[found.faction]}` }}
                >
                  {found.avatar}
                </div>
                <span className={s.playerName}>{found.username}</span>
                <span className={s.playerMeta} style={{ color: F_COLOR[found.faction] }}>
                  {F_LABEL[found.faction]} · {found.rating} ЭЛО
                </span>
                <span className={s.colorBadge} style={{ borderColor: "#FF2D78", color: "#FF2D78" }}>
                  ♟ ЧЁРНЫЕ
                </span>
                <button className={s.changeBtn} onClick={() => { setFound(null); setP2input(""); }}>
                  ИЗМЕНИТЬ
                </button>
              </>
            ) : found === "guest" ? (
              <>
                <div className={s.avatar} style={{ background: "#333", boxShadow: "0 0 10px #333" }}>
                  {(p2input.trim() || "Гость").slice(0, 2).toUpperCase()}
                </div>
                <span className={s.playerName}>{p2input.trim() || "Гость"}</span>
                <span className={s.playerMeta} style={{ color: "#555" }}>Гость · Без рейтинга</span>
                <span className={s.colorBadge} style={{ borderColor: "#FF2D78", color: "#FF2D78" }}>
                  ♟ ЧЁРНЫЕ
                </span>
                <button className={s.changeBtn} onClick={() => { setFound(null); setP2input(""); }}>
                  ИЗМЕНИТЬ
                </button>
              </>
            ) : (
              <>
                <div className={s.avatarEmpty}>?</div>
                <div className={s.searchRow}>
                  <input
                    className={s.input}
                    type="text"
                    placeholder="Позывной..."
                    value={p2input}
                    onChange={e => { setP2input(e.target.value); setError(""); }}
                    onKeyDown={e => e.key === "Enter" && search()}
                    autoComplete="off"
                  />
                  <button className={s.searchBtn} onClick={search} disabled={!p2input.trim()}>
                    НАЙТИ
                  </button>
                </div>
                {error && <p className={s.error}>{error}</p>}
                <button className={s.guestBtn} onClick={playAsGuest}>
                  Играть как гость{p2input.trim() ? ` «${p2input.trim()}»` : ""}
                </button>
              </>
            )}
          </div>
        </div>

        <div className={s.actions}>
          <button className={s.backBtn} onClick={onBack}>← НАЗАД</button>
          <button
            className={s.startBtn}
            disabled={!found}
            onClick={handleStart}
          >
            НАЧАТЬ ПАРТИЮ →
          </button>
        </div>
      </div>
    </div>
  );
}
