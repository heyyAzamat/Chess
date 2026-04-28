import { getHint, type HintResult } from "./hintEngine";

self.onmessage = (e: MessageEvent<{ fen: string; depth: number }>) => {
  const result: HintResult | null = getHint(e.data.fen, e.data.depth);
  self.postMessage(result);
};
