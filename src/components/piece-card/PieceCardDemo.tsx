import { PieceCard } from "./PieceCard";
import { usePieceCard } from "./usePieceCard";
import type { ChessColor, PieceType } from "../../narrative/narrative.types";

const WHITE_PIECES: PieceType[] = ["king", "queen", "rook", "bishop", "knight", "pawn"];
const BLACK_PIECES: PieceType[] = ["king", "queen", "rook", "bishop", "knight", "pawn"];

const PIECE_SYMBOLS: Record<ChessColor, Record<PieceType, string>> = {
  white: { king: "♔", queen: "♕", rook: "♖", bishop: "♗", knight: "♘", pawn: "♙" },
  black: { king: "♚", queen: "♛", rook: "♜", bishop: "♝", knight: "♞", pawn: "♟" },
};

const PIECE_NAMES_RU: Record<PieceType, string> = {
  king: "Король", queen: "Ферзь", rook: "Ладья",
  bishop: "Слон", knight: "Конь", pawn: "Пешка",
};

export function PieceCardDemo() {
  const { selectedPiece, toggleCard, closeCard } = usePieceCard();

  const btnBase: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
    padding: "12px 16px",
    background: "#111",
    border: "2px solid #222",
    cursor: "pointer",
    transition: "all 0.15s",
    minWidth: 70,
  };

  function PieceButton({ color, type }: { color: ChessColor; type: PieceType }) {
    const isActive =
      selectedPiece?.color === color && selectedPiece?.type === type;
    const accent = color === "white" ? "#4A90D9" : "#FF2D78";

    return (
      <button
        style={{
          ...btnBase,
          borderColor: isActive ? accent : "#222",
          boxShadow: isActive ? `0 0 12px ${accent}66` : "none",
          background: isActive ? "#1a1a2e" : "#111",
        }}
        onClick={() => toggleCard({ color, type })}
        title={PIECE_NAMES_RU[type]}
      >
        <span style={{ fontSize: 32, color: isActive ? accent : "#ccc", lineHeight: 1 }}>
          {PIECE_SYMBOLS[color][type]}
        </span>
        <span style={{
          fontFamily: "'Share Tech Mono', monospace",
          fontSize: 9,
          color: isActive ? accent : "#555",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
        }}>
          {PIECE_NAMES_RU[type]}
        </span>
      </button>
    );
  }

  const sectionLabel = (text: string, color: string) => (
    <p style={{
      fontFamily: "'Share Tech Mono', monospace",
      fontSize: 10,
      letterSpacing: "0.2em",
      color,
      textTransform: "uppercase",
      margin: "0 0 10px",
    }}>
      {text}
    </p>
  );

  return (
    <div style={{
      minHeight: "100dvh",
      background: "#0A0A0F",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
      gap: 32,
      fontFamily: "'Share Tech Mono', monospace",
    }}>
      <h1 style={{
        fontFamily: "'Bangers', cursive",
        fontSize: 32,
        color: "#FFEE00",
        textShadow: "0 0 20px #FFEE0066",
        letterSpacing: "0.1em",
        margin: 0,
        textAlign: "center",
      }}>
        КАРТОЧКИ ПЕРСОНАЖЕЙ
      </h1>

      <p style={{ color: "#444", fontSize: 11, margin: 0, letterSpacing: "0.1em" }}>
        КЛИКНИ НА ФИГУРУ — УВИДИШЬ ПЕРСОНАЖА
      </p>

      {/* Aurora — white */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
        {sectionLabel("◈ АВРОРА — Белый Протокол", "#4A90D9")}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
          {WHITE_PIECES.map((t) => (
            <PieceButton key={t} color="white" type={t} />
          ))}
        </div>
      </div>

      {/* Divider */}
      <div style={{ width: 200, height: 1, background: "#1a1a1a" }} />

      {/* Nova — black */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
        {sectionLabel("◈ НОВА — Чёрный Манифест", "#FF2D78")}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
          {BLACK_PIECES.map((t) => (
            <PieceButton key={t} color="black" type={t} />
          ))}
        </div>
      </div>

      {/* Card */}
      {selectedPiece && (
        <PieceCard
          color={selectedPiece.color}
          pieceType={selectedPiece.type}
          onClose={closeCard}
        />
      )}
    </div>
  );
}
