import { useEffect, useState } from "react";
import type { ChessColor, PieceType } from "../../narrative/narrative.types";
import { getPieceCharacter, getFactionTheme } from "../../narrative/narrative.service";
import styles from "./PieceCard.module.css";

interface Props {
  color: ChessColor;
  pieceType: PieceType;
  onClose: () => void;
}

// Unicode chess symbols: white / black
const PIECE_SYMBOLS: Record<ChessColor, Record<PieceType, string>> = {
  white: { king: "♔", queen: "♕", rook: "♖", bishop: "♗", knight: "♘", pawn: "♙" },
  black: { king: "♚", queen: "♛", rook: "♜", bishop: "♝", knight: "♞", pawn: "♟" },
};

const PIECE_TACTICS: Record<PieceType, string> = {
  king:   "Один шаг в любую сторону. Ценен сверх меры — потеря означает конец.",
  queen:  "Движется куда угодно и на любое расстояние. Самый опасный агент на поле.",
  rook:   "Контролирует горизонталь и вертикаль. Открытые линии — её территория.",
  bishop: "Только диагональ. Никогда не меняет цвет своего поля — это судьба.",
  knight: "Прыжок буквой Г через любые препятствия. Непредсказуем по определению.",
  pawn:   "Один шаг вперёд. Бьёт только по диагонали. Дойди до края — стань кем угодно.",
};

const FACTION_LABEL: Record<ChessColor, string> = {
  white: "АВРОРА · БЕЛЫЙ ПРОТОКОЛ",
  black: "НОВА · ЧЁРНЫЙ МАНИФЕСТ",
};

export function PieceCard({ color, pieceType, onClose }: Props) {
  const [isExiting, setIsExiting] = useState(false);
  const character = getPieceCharacter(color, pieceType);
  const theme = getFactionTheme(color);
  const symbol = PIECE_SYMBOLS[color][pieceType];

  const displayName = character.name ?? character.names?.[0] ?? "—";
  const altName = character.names?.[1];

  function handleClose() {
    setIsExiting(true);
    setTimeout(onClose, 300);
  }

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`${styles.backdrop} ${isExiting ? styles.backdropExit : ""}`}
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Card */}
      <aside
        className={`${styles.card} ${isExiting ? styles.cardExit : styles.cardEnter}`}
        style={{
          "--faction-primary":   theme.primary,
          "--faction-secondary": theme.secondary,
          "--faction-accent":    theme.accent,
          "--faction-glow":      theme.glow,
        } as React.CSSProperties}
        role="complementary"
        aria-label={`Персонаж: ${displayName}`}
      >
        {/* Faction bar */}
        <div className={styles.factionBar}>
          <span className={styles.factionLabel}>{FACTION_LABEL[color]}</span>
          <button className={styles.closeBtn} onClick={handleClose} aria-label="Закрыть">✕</button>
        </div>

        {/* Hero section */}
        <div className={styles.hero}>
          <div className={styles.symbolWrap}>
            <span className={styles.symbol}>{symbol}</span>
            <div className={styles.symbolGlow} />
          </div>

          <div className={styles.heroText}>
            <h2 className={styles.charName}>{displayName}</h2>
            {altName && (
              <p className={styles.altName}>и {altName}</p>
            )}
            <p className={styles.charTitle}>{character.title}</p>
          </div>
        </div>

        {/* Divider */}
        <div className={styles.divider} />

        {/* Quote */}
        <blockquote className={styles.quote}>
          <span className={styles.quoteOpen}>"</span>
          {character.quote}
          <span className={styles.quoteClose}>"</span>
        </blockquote>

        {/* Bio */}
        <p className={styles.bio}>{character.bio}</p>

        {/* Personality tags */}
        <div className={styles.tags}>
          {character.personality.map((tag) => (
            <span key={tag} className={styles.tag}>
              {tag.replace(/_/g, " ")}
            </span>
          ))}
        </div>

        {/* Divider */}
        <div className={styles.divider} />

        {/* Tactics */}
        <div className={styles.tactics}>
          <span className={styles.tacticsLabel}>ТАКТИКА</span>
          <p className={styles.tacticsText}>{PIECE_TACTICS[pieceType]}</p>
        </div>

        {/* Promotion quote for pawns */}
        {character.promotionQuote && (
          <div className={styles.promotionBanner}>
            <span className={styles.promotionIcon}>⬆</span>
            <p className={styles.promotionText}>{character.promotionQuote}</p>
          </div>
        )}
      </aside>
    </>
  );
}
