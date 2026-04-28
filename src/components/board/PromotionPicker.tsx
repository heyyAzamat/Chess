import { ChessPiece } from "../pieces/ChessPiece";
import type { ChessColor } from "../../narrative/narrative.types";
import styles from "./Board.module.css";

interface Props {
  color: ChessColor;
  onPick: (piece: "q" | "r" | "b" | "n") => void;
}

const OPTIONS: Array<{ sym: "q" | "r" | "b" | "n"; label: string }> = [
  { sym: "q", label: "Ферзь" },
  { sym: "r", label: "Ладья" },
  { sym: "b", label: "Слон" },
  { sym: "n", label: "Конь" },
];

const PIECE_MAP: Record<string, "queen" | "rook" | "bishop" | "knight"> = {
  q: "queen", r: "rook", b: "bishop", n: "knight",
};

export function PromotionPicker({ color, onPick }: Props) {
  return (
    <div className={styles.promotionOverlay}>
      <div className={styles.promotionBox}>
        <p className={styles.promotionTitle}>ВЫБЕРИ ФИГУРУ</p>
        <div className={styles.promotionOptions}>
          {OPTIONS.map(({ sym, label }) => (
            <button
              key={sym}
              className={styles.promotionBtn}
              onClick={() => onPick(sym)}
            >
              <ChessPiece type={PIECE_MAP[sym]} color={color} size={56} glowIntensity="medium" />
              <span className={styles.promotionLabel}>{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
