import { useCallback } from "react";
import { soundEngine, type SoundType } from "../services/soundEngine";

export function useSound() {
  const play = useCallback((type: SoundType) => {
    soundEngine.play(type);
  }, []);

  return { play };
}
