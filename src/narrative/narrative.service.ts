import type {
  NarrativeData,
  ComicScene,
  PieceCharacter,
  PieceType,
  ChessColor,
  CaptureFlavorTexts,
} from "./narrative.types";

import narrativeData from "./eden-zero.narrative.json";

const data = narrativeData as unknown as NarrativeData;

export function getNarrativeData(): NarrativeData {
  return data;
}

export function getSceneForGameStart(): ComicScene | undefined {
  return data.comicPanels.find((s) => s.trigger.event === "game_start");
}

export function getSceneForMove(moveNumber: number): ComicScene | undefined {
  return data.comicPanels.find(
    (s) =>
      s.trigger.event === "move_number" &&
      s.trigger.condition?.move === moveNumber
  );
}

export function getSceneForCapture(piece: PieceType): ComicScene | undefined {
  return data.comicPanels.find(
    (s) =>
      s.trigger.event === "piece_captured" &&
      s.trigger.condition?.piece === piece
  );
}

export function getSceneForCheckmate(): ComicScene | undefined {
  return data.comicPanels.find((s) => s.trigger.event === "checkmate");
}

export function getPieceCharacter(
  color: ChessColor,
  piece: PieceType
): PieceCharacter {
  return data.pieces[color][piece];
}

export function getRandomCaptureText(piece: PieceType): string {
  const texts = data.captureFlavorTexts[piece as keyof CaptureFlavorTexts];
  return texts[Math.floor(Math.random() * texts.length)];
}

export function getFactionTheme(color: ChessColor) {
  return data.factions[color].theme;
}
