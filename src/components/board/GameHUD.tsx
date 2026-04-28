import { ChessPiece } from "../pieces/ChessPiece";
import type { ChessColor, PieceType } from "../../narrative/narrative.types";
import type { GameMode } from "./Board";
import styles from "./Board.module.css";

interface CapturedEntry { type: PieceType; color: ChessColor }

interface Props {
  turn: "w" | "b";
  botThinking: boolean;
  moveCount: number;
  captured: CapturedEntry[];
  lastEvent: string | null;
  gameStatus: "playing" | "check" | "checkmate" | "stalemate" | "draw";
  playerColor: ChessColor;
  mode: GameMode;
  multiTurnColor: ChessColor;
  onNewGame: () => void;
}

const PIECE_VALUE: Record<PieceType, number> = {
  pawn: 1, knight: 3, bishop: 3, rook: 5, queen: 9, king: 0,
};

export function GameHUD({
  turn, botThinking, moveCount, captured, lastEvent,
  gameStatus, playerColor, mode, multiTurnColor, onNewGame,
}: Props) {
  const isOver = gameStatus === "checkmate" || gameStatus === "stalemate" || gameStatus === "draw";
  const isPlayerTurn = turn === (playerColor === "white" ? "w" : "b");
  const isMultiplayer = mode === "multiplayer";
  const isTraining    = mode === "training";

  const playerCap = captured.filter(c => c.color !== playerColor);
  const botCap    = captured.filter(c => c.color === playerColor);
  const advantage = playerCap.reduce((s, c) => s + PIECE_VALUE[c.type], 0)
                  - botCap.reduce((s, c) => s + PIECE_VALUE[c.type], 0);

  const leftFaction  = isMultiplayer ? "АВРОРА" : (playerColor === "white" ? "АВРОРА" : "НОВА");
  const rightFaction = isMultiplayer ? "НОВА"   : (playerColor === "white" ? "НОВА"   : "АВРОРА");
  const leftColor    = isMultiplayer ? "#4A90D9"  : (playerColor === "white" ? "#4A90D9"  : "#FF2D78");
  const rightColor   = isMultiplayer ? "#FF2D78"  : (playerColor === "white" ? "#FF2D78"  : "#4A90D9");
  const leftRole     = isMultiplayer ? "ИГРОК 1" : "ИГРОК";
  const rightRole    = isMultiplayer ? "ИГРОК 2" : (isTraining ? "ТРЕНЕР" : "БОТ");

  function statusText() {
    if (isMultiplayer) {
      if (gameStatus === "checkmate") {
        const winner = multiTurnColor === "white" ? "НОВА" : "АВРОРА";
        return `☠ МАТ — ПОБЕДА ${winner}`;
      }
      if (gameStatus === "stalemate") return "— ПАТ — НИЧЬЯ";
      if (gameStatus === "draw")      return "— НИЧЬЯ";
      if (gameStatus === "check")     return `⚠ ШАХ — ${multiTurnColor === "white" ? "АВРОРА" : "НОВА"}`;
      return `▶ ${multiTurnColor === "white" ? "АВРОРА" : "НОВА"} — ХОД`;
    }
    if (gameStatus === "checkmate") return isPlayerTurn ? "☠ МАТ — ВЫ ПРОИГРАЛИ" : "♛ МАТ — ПОБЕДА";
    if (gameStatus === "stalemate") return "— ПАТ — НИЧЬЯ";
    if (gameStatus === "draw")      return "— НИЧЬЯ";
    if (gameStatus === "check" && isPlayerTurn) return "⚠ ВАШ КОРОЛЬ ПОД ШАХОМ";
    if (botThinking) return isTraining ? "● ТРЕНЕР ОТВЕЧАЕТ..." : "● БОТ ДУМАЕТ...";
    if (isPlayerTurn) return "▶ ВАШ ХОД";
    return "● ПРОТИВНИК ДУМАЕТ...";
  }

  const statusColor =
    gameStatus === "checkmate" && !isPlayerTurn && !isMultiplayer ? "#FFEE00" :
    gameStatus === "checkmate" ? "#FF2D78" :
    gameStatus === "check" && isPlayerTurn ? "#FF6B1A" :
    isPlayerTurn || isMultiplayer ? leftColor : rightColor;

  return (
    <div className={styles.hud}>
      <div className={styles.hudFactions}>
        <div className={styles.hudFaction}>
          <span className={styles.hudFactionLabel} style={{ color: leftColor }}>{leftFaction}</span>
          <span className={styles.hudRole}>{leftRole}</span>
          {!isMultiplayer && advantage > 0 && (
            <span className={styles.hudAdvantage} style={{ color: leftColor }}>+{advantage}</span>
          )}
        </div>

        <div className={styles.hudMoveCount}>
          <span className={styles.hudMoveNum}>{Math.ceil(moveCount / 2)}</span>
          <span className={styles.hudMoveLabel}>ХОД</span>
        </div>

        <div className={styles.hudFaction} style={{ textAlign: "right" }}>
          <span className={styles.hudFactionLabel} style={{ color: rightColor }}>{rightFaction}</span>
          <span className={styles.hudRole}>{rightRole}</span>
          {!isMultiplayer && advantage < 0 && (
            <span className={styles.hudAdvantage} style={{ color: rightColor }}>+{Math.abs(advantage)}</span>
          )}
        </div>
      </div>

      <div
        className={`${styles.hudStatus} ${botThinking && !isOver ? styles.hudStatusPulse : ""}`}
        style={{ color: statusColor, borderColor: `${statusColor}44` }}
      >
        {statusText()}
      </div>

      {lastEvent && (
        <div className={styles.hudEvent}>
          <span className={styles.hudEventText}>{lastEvent}</span>
        </div>
      )}

      {(playerCap.length > 0 || botCap.length > 0) && !isMultiplayer && (
        <div className={styles.hudCaptures}>
          {playerCap.length > 0 && (
            <div className={styles.captureRow}>
              <span className={styles.captureWho} style={{ color: leftColor }}>{leftFaction}:</span>
              <div className={styles.captureIcons}>
                {playerCap.map((c, i) => <ChessPiece key={i} type={c.type} color={c.color} size={22} glowIntensity="low" />)}
              </div>
            </div>
          )}
          {botCap.length > 0 && (
            <div className={styles.captureRow}>
              <span className={styles.captureWho} style={{ color: rightColor }}>{rightFaction}:</span>
              <div className={styles.captureIcons}>
                {botCap.map((c, i) => <ChessPiece key={i} type={c.type} color={c.color} size={22} glowIntensity="low" />)}
              </div>
            </div>
          )}
        </div>
      )}

      {isOver && (
        <button
          className={styles.newGameBtn}
          onClick={onNewGame}
          style={{ "--btn-glow": statusColor } as React.CSSProperties}
        >
          НОВАЯ ПАРТИЯ
        </button>
      )}
    </div>
  );
}
