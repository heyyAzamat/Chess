import { useState, useCallback } from "react";
import type { ChessColor, PieceType } from "../../narrative/narrative.types";

export interface SelectedPiece {
  color: ChessColor;
  type: PieceType;
}

interface PieceCardState {
  selectedPiece: SelectedPiece | null;
  openCard: (piece: SelectedPiece) => void;
  closeCard: () => void;
  toggleCard: (piece: SelectedPiece) => void;
}

export function usePieceCard(): PieceCardState {
  const [selectedPiece, setSelectedPiece] = useState<SelectedPiece | null>(null);

  const openCard = useCallback((piece: SelectedPiece) => {
    setSelectedPiece(piece);
  }, []);

  const closeCard = useCallback(() => {
    setSelectedPiece(null);
  }, []);

  // Повторный клик на ту же фигуру закрывает карточку
  const toggleCard = useCallback((piece: SelectedPiece) => {
    setSelectedPiece((prev) =>
      prev?.color === piece.color && prev?.type === piece.type ? null : piece
    );
  }, []);

  return { selectedPiece, openCard, closeCard, toggleCard };
}
