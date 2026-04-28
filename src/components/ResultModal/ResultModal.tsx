import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import s from "./ResultModal.module.css";

export interface PlayerElo {
  username: string;
  faction: "АВРОРА" | "НОВА";
  eloDelta: number;
  newRating: number;
  isWinner: boolean;
}

export interface ResultData {
  outcome: "win" | "loss" | "draw";
  reason: "checkmate" | "stalemate" | "resign" | "agreement" | "draw" | "timeout";
  playerFaction: "АВРОРА" | "НОВА";
  opponentFaction: "АВРОРА" | "НОВА";
  opponentName?: string;
  moveCount: number;
  // Single player ELO (bot/online)
  eloDelta?: number;
  newRating?: number;
  // Multiplayer: оба игрока
  multiElo?: [PlayerElo, PlayerElo];
}

interface Props {
  data: ResultData;
  onNewGame: () => void;
  onCoach?: () => void;  // show AI coach analysis
}

const REASON_TEXT: Record<string, string> = {
  checkmate:  "Шах и мат",
  stalemate:  "Пат",
  resign:     "Соперник сдался",
  agreement:  "Договорная ничья",
  draw:       "Ничья",
  timeout:    "Время вышло",
};

const OUTCOME_CONFIG = {
  win: {
    headline: "ПОБЕДА",
    sub: "Протокол выполнен. Оракул — ваш.",
    headColor: "#FFEE00",
    glowColor: "#FFEE0044",
    borderColor: "#FFEE00",
    icon: "♛",
  },
  loss: {
    headline: "ПОРАЖЕНИЕ",
    sub: "Система пала. Начни заново.",
    headColor: "#FF2D78",
    glowColor: "#FF2D7822",
    borderColor: "#FF2D78",
    icon: "☠",
  },
  draw: {
    headline: "НИЧЬЯ",
    sub: "Равновесие сохранено. Война продолжается.",
    headColor: "#888",
    glowColor: "#88888822",
    borderColor: "#555",
    icon: "⚖",
  },
};

export function ResultModal({ data, onNewGame, onCoach }: Props) {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);

  // Небольшая задержка перед появлением — даём доске "осесть"
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 480);
    return () => clearTimeout(t);
  }, []);

  const cfg = OUTCOME_CONFIG[data.outcome];
  const playerColor = data.playerFaction === "АВРОРА" ? "#4A90D9" : "#FF2D78";
  const oppColor    = data.opponentFaction === "АВРОРА" ? "#4A90D9" : "#FF2D78";

  return (
    <div className={`${s.overlay} ${visible ? s.overlayVisible : ""}`}>
      <div className={s.modal} style={{ "--border": cfg.borderColor, "--glow": cfg.glowColor } as React.CSSProperties}>

        {/* Halftone bg */}
        <div className={s.halftone} />

        {/* Speed lines */}
        <svg className={s.speedLines} viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice">
          {Array.from({ length: 20 }, (_, i) => {
            const angle = (i / 20) * 360;
            const rad = (angle * Math.PI) / 180;
            return (
              <line key={i}
                x1="200" y1="200"
                x2={200 + Math.cos(rad) * 300}
                y2={200 + Math.sin(rad) * 300}
                stroke={cfg.headColor}
                strokeWidth={i % 4 === 0 ? "1.5" : "0.5"}
                opacity="0.12"
              />
            );
          })}
        </svg>

        {/* Faction battle line */}
        <div className={s.factionLine}>
          <span className={s.factionBadge} style={{ color: playerColor, borderColor: playerColor }}>
            {data.playerFaction}
          </span>
          <span className={s.vsLabel}>VS</span>
          <span className={s.factionBadge} style={{ color: oppColor, borderColor: oppColor }}>
            {data.opponentFaction}
          </span>
        </div>

        {/* Main result */}
        <div className={s.resultBlock}>
          <span className={s.icon} style={{ color: cfg.headColor, textShadow: `0 0 30px ${cfg.headColor}` }}>
            {cfg.icon}
          </span>
          <h1 className={s.headline} style={{ color: cfg.headColor, textShadow: `0 0 30px ${cfg.headColor}66, 4px 4px 0 #000` }}>
            {cfg.headline}
          </h1>
          <p className={s.sub}>{cfg.sub}</p>
        </div>

        {/* Reason */}
        <div className={s.reasonBadge} style={{ borderColor: `${cfg.headColor}44`, color: cfg.headColor }}>
          {REASON_TEXT[data.reason] ?? data.reason}
        </div>

        {/* Stats */}
        <div className={s.stats}>
          <div className={s.stat}>
            <span className={s.statNum}>{Math.ceil(data.moveCount / 2)}</span>
            <span className={s.statLabel}>ХОДОВ</span>
          </div>

          {data.eloDelta !== undefined && data.newRating !== undefined && (
            <div className={s.stat}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                <span className={s.statNum} style={{ color: cfg.headColor }}>
                  {data.newRating}
                </span>
                <span style={{
                  fontFamily: "'Bangers', cursive",
                  fontSize: 18,
                  color: data.eloDelta > 0 ? "#4caf50" : data.eloDelta < 0 ? "#f44336" : "#888",
                }}>
                  {data.eloDelta > 0 ? `+${data.eloDelta}` : data.eloDelta}
                </span>
              </div>
              <span className={s.statLabel}>ЭЛО</span>
            </div>
          )}

          {data.opponentName && (
            <div className={s.stat}>
              <span className={s.statNum} style={{ fontSize: 16, color: oppColor }}>{data.opponentName}</span>
              <span className={s.statLabel}>СОПЕРНИК</span>
            </div>
          )}
        </div>

        {/* Multiplayer ELO table */}
        {data.multiElo && (
          <div className={s.multiEloBlock}>
            {data.multiElo.map((p) => {
              const fc = p.faction === "АВРОРА" ? "#4A90D9" : "#FF2D78";
              const deltaColor = p.eloDelta > 0 ? "#4caf50" : p.eloDelta < 0 ? "#f44336" : "#888";
              return (
                <div key={p.username} className={s.multiEloRow}>
                  <span className={s.multiEloCrown}>{p.isWinner ? "♛" : "·"}</span>
                  <span className={s.multiEloName} style={{ color: fc }}>{p.username}</span>
                  <span className={s.multiEloFaction} style={{ color: fc }}>{p.faction}</span>
                  <span className={s.multiEloRating}>{p.newRating}</span>
                  <span className={s.multiEloDelta} style={{ color: deltaColor }}>
                    {p.eloDelta > 0 ? `+${p.eloDelta}` : p.eloDelta}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Divider */}
        <div className={s.divider} style={{ background: `linear-gradient(to right, transparent, ${cfg.headColor}44, transparent)` }} />

        {/* Action buttons */}
        <div className={s.actions}>
          <button
            className={s.btnPrimary}
            style={{ "--bc": cfg.headColor } as React.CSSProperties}
            onClick={onNewGame}
          >
            НОВАЯ ПАРТИЯ
          </button>
          {onCoach && (
            <button
              className={s.btnSecondary}
              style={{ color: "#4A90D9", borderColor: "#4A90D944" }}
              onClick={onCoach}
            >
              🧠 АНАЛИЗ ИИ
            </button>
          )}
          <button
            className={s.btnSecondary}
            onClick={() => navigate("/")}
          >
            ГЛАВНОЕ МЕНЮ
          </button>
        </div>

      </div>
    </div>
  );
}
