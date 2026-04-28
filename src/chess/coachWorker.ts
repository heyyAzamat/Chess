import { analyzeGame, type CoachMoveRecord, type CoachReport } from "./coach";

interface WorkerInput {
  records: CoachMoveRecord[];
  playerColor: "w" | "b";
  depth: number;
}

interface ProgressMsg { type: "progress"; done: number; total: number; }
interface ResultMsg   { type: "result";   report: CoachReport; }

self.onmessage = (e: MessageEvent<WorkerInput>) => {
  const { records, playerColor, depth } = e.data;

  const report = analyzeGame(records, playerColor, depth, (done, total) => {
    self.postMessage({ type: "progress", done, total } satisfies ProgressMsg);
  });

  self.postMessage({ type: "result", report } satisfies ResultMsg);
};
