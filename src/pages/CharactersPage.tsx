import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChessPiece } from "../components/pieces/ChessPiece";
import { PieceCard } from "../components/piece-card/PieceCard";
import { usePieceCard } from "../components/piece-card/usePieceCard";
import { getNarrativeData } from "../narrative/narrative.service";
import type { ChessColor, PieceType } from "../narrative/narrative.types";
import s from "./SecondaryPage.module.css";

const PIECES: PieceType[] = ["king", "queen", "rook", "bishop", "knight", "pawn"];
const PIECE_NAMES: Record<PieceType, string> = {
  king: "Король", queen: "Ферзь", rook: "Ладья",
  bishop: "Слон", knight: "Конь", pawn: "Пешка",
};

export function CharactersPage() {
  const navigate = useNavigate();
  const { selectedPiece, toggleCard, closeCard } = usePieceCard();
  const [activeFaction, setActiveFaction] = useState<ChessColor | "all">("all");
  const narrative = getNarrativeData();

  const factions: { color: ChessColor; label: string; glowColor: string }[] = [
    { color: "white", label: "АВРОРА", glowColor: "#4A90D9" },
    { color: "black", label: "НОВА",   glowColor: "#FF2D78" },
  ];

  const showFactions = activeFaction === "all"
    ? factions
    : factions.filter(f => f.color === activeFaction);

  return (
    <div className={s.page}>
      <header className={s.header}>
        <button className={s.backBtn} onClick={() => navigate("/")}>← НАЗАД</button>
        <h1 className={s.pageTitle}>ПЕРСОНАЖИ</h1>
        <div className={s.filterTabs}>
          {(["all", "white", "black"] as const).map(f => (
            <button
              key={f}
              className={`${s.filterTab} ${activeFaction === f ? s.filterTabActive : ""}`}
              onClick={() => setActiveFaction(f)}
            >
              {f === "all" ? "ВСЕ" : f === "white" ? "АВРОРА" : "НОВА"}
            </button>
          ))}
        </div>
      </header>

      <main className={s.main}>
        {showFactions.map(({ color, label, glowColor }) => (
          <section key={color} className={s.section}>
            <h2 className={s.sectionTitle} style={{ color: glowColor }}>
              ◈ {label} — {narrative.factions[color].tagline}
            </h2>
            <p className={s.sectionMotto}>"{narrative.factions[color].motto}"</p>

            <div className={s.charGrid}>
              {PIECES.map(type => {
                const char = narrative.pieces[color][type];
                const name = char.name ?? char.names?.[0] ?? type;
                const isSelected = selectedPiece?.color === color && selectedPiece.type === type;

                return (
                  <button
                    key={type}
                    className={`${s.charCard} ${isSelected ? s.charCardActive : ""}`}
                    style={{ "--c": glowColor } as React.CSSProperties}
                    onClick={() => toggleCard({ color, type })}
                  >
                    <div className={s.charPiece}>
                      <ChessPiece type={type} color={color} size={56} glowIntensity={isSelected ? "high" : "low"} selected={isSelected} />
                    </div>
                    <div className={s.charInfo}>
                      <span className={s.charType}>{PIECE_NAMES[type]}</span>
                      <span className={s.charName}>{name}</span>
                      <span className={s.charTitle}>{char.title}</span>
                    </div>
                    <p className={s.charQuote}>"{char.quote}"</p>
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </main>

      {selectedPiece && (
        <PieceCard color={selectedPiece.color} pieceType={selectedPiece.type} onClose={closeCard} />
      )}
    </div>
  );
}
