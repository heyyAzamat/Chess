import { useState, useCallback } from "react";
import type { ComicScene, PieceType } from "../../narrative/narrative.types";
import {
  getSceneForGameStart,
  getSceneForMove,
  getSceneForCapture,
  getSceneForCheckmate,
} from "../../narrative/narrative.service";

interface ComicTriggerState {
  activeScene: ComicScene | null;
  showScene: (scene: ComicScene) => void;
  closeScene: () => void;
  onGameStart: () => void;
  onMove: (moveNumber: number) => void;
  onCapture: (piece: PieceType) => void;
  onCheckmate: () => void;
}

// Move numbers that trigger narrative panels
const NARRATIVE_MOVES = new Set([10]);

export function useComicTrigger(): ComicTriggerState {
  const [activeScene, setActiveScene] = useState<ComicScene | null>(null);

  const showScene = useCallback((scene: ComicScene) => {
    setActiveScene(scene);
  }, []);

  const closeScene = useCallback(() => {
    setActiveScene(null);
  }, []);

  const onGameStart = useCallback(() => {
    const scene = getSceneForGameStart();
    if (scene) setActiveScene(scene);
  }, []);

  const onMove = useCallback((moveNumber: number) => {
    if (!NARRATIVE_MOVES.has(moveNumber)) return;
    const scene = getSceneForMove(moveNumber);
    if (scene) setActiveScene(scene);
  }, []);

  const onCapture = useCallback((piece: PieceType) => {
    const scene = getSceneForCapture(piece);
    if (scene) setActiveScene(scene);
  }, []);

  const onCheckmate = useCallback(() => {
    const scene = getSceneForCheckmate();
    if (scene) setActiveScene(scene);
  }, []);

  return {
    activeScene,
    showScene,
    closeScene,
    onGameStart,
    onMove,
    onCapture,
    onCheckmate,
  };
}
