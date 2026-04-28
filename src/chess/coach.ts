import { Chess } from "chess.js";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface CoachMoveRecord {
  fenBefore: string;
  san: string;
  from: string;
  to: string;
  promotion?: string;
  moveNum: number;
  color: "w" | "b";
}

export type MistakeType = "blunder" | "mistake" | "inaccuracy";

export interface CoachAnalysis {
  moveNum: number;
  color: "w" | "b";
  playedSan: string;
  bestSan: string;
  bestFrom: string;
  bestTo: string;
  evalDrop: number;       // centipawns — сколько потеряли
  type: MistakeType;
  headline: string;
  tip: string;            // конкретный совет
  fenBefore: string;
}

export interface CoachReport {
  analyses: CoachAnalysis[];       // sorted worst → best
  blunders: number;
  mistakes: number;
  inaccuracies: number;
  accuracy: number;                // 0-100%
}

// ── Minimax (self-contained copy) ─────────────────────────────────────────────

const MAT: Record<string, number> = { p:100, n:320, b:330, r:500, q:900, k:20000 };

const PST: Record<string, number[]> = {
  p:  [ 0,0,0,0,0,0,0,0, 50,50,50,50,50,50,50,50, 10,10,20,30,30,20,10,10, 5,5,10,25,25,10,5,5, 0,0,0,20,20,0,0,0, 5,-5,-10,0,0,-10,-5,5, 5,10,10,-20,-20,10,10,5, 0,0,0,0,0,0,0,0 ],
  n:  [ -50,-40,-30,-30,-30,-30,-40,-50, -40,-20,0,0,0,0,-20,-40, -30,0,10,15,15,10,0,-30, -30,5,15,20,20,15,5,-30, -30,0,15,20,20,15,0,-30, -30,5,10,15,15,10,5,-30, -40,-20,0,5,5,0,-20,-40, -50,-40,-30,-30,-30,-30,-40,-50 ],
  b:  [ -20,-10,-10,-10,-10,-10,-10,-20, -10,0,0,0,0,0,0,-10, -10,0,5,10,10,5,0,-10, -10,5,5,10,10,5,5,-10, -10,0,10,10,10,10,0,-10, -10,10,10,10,10,10,10,-10, -10,5,0,0,0,0,5,-10, -20,-10,-10,-10,-10,-10,-10,-20 ],
  r:  [ 0,0,0,0,0,0,0,0, 5,10,10,10,10,10,10,5, -5,0,0,0,0,0,0,-5, -5,0,0,0,0,0,0,-5, -5,0,0,0,0,0,0,-5, -5,0,0,0,0,0,0,-5, -5,0,0,0,0,0,0,-5, 0,0,0,5,5,0,0,0 ],
  q:  [ -20,-10,-10,-5,-5,-10,-10,-20, -10,0,0,0,0,0,0,-10, -10,0,5,5,5,5,0,-10, -5,0,5,5,5,5,0,-5, 0,0,5,5,5,5,0,-5, -10,5,5,5,5,5,0,-10, -10,0,5,0,0,0,0,-10, -20,-10,-10,-5,-5,-10,-10,-20 ],
  k:  [ -30,-40,-40,-50,-50,-40,-40,-30, -30,-40,-40,-50,-50,-40,-40,-30, -30,-40,-40,-50,-50,-40,-40,-30, -30,-40,-40,-50,-50,-40,-40,-30, -20,-30,-30,-40,-40,-30,-30,-20, -10,-20,-20,-20,-20,-20,-20,-10, 20,20,0,0,0,0,20,20, 20,30,10,0,0,10,30,20 ],
};

function evaluate(g: Chess): number {
  if (g.isCheckmate()) return g.turn() === "w" ? -50000 : 50000;
  if (g.isDraw())      return 0;
  let score = 0;
  const board = g.board();
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (!p) continue;
      const idx = p.color === "w" ? r*8+c : (7-r)*8+c;
      score += (p.color === "w" ? 1 : -1) * ((MAT[p.type] ?? 0) + (PST[p.type]?.[idx] ?? 0));
    }
  }
  return score;
}

function orderMoves(moves: ReturnType<Chess["moves"]>) {
  return [...moves].sort((a: any, b: any) =>
    (MAT[(b as any).captured ?? ""] ?? 0) - (MAT[(a as any).captured ?? ""] ?? 0)
  ) as any[];
}

function minimax(g: Chess, depth: number, alpha: number, beta: number, max: boolean): number {
  if (depth === 0 || g.isGameOver()) return evaluate(g);
  const moves = orderMoves(g.moves({ verbose: true }) as any[]);
  if (max) {
    let best = -Infinity;
    for (const m of moves) {
      g.move(m); best = Math.max(best, minimax(g, depth-1, alpha, beta, false)); g.undo();
      alpha = Math.max(alpha, best);
      if (beta <= alpha) break;
    }
    return best;
  } else {
    let best = Infinity;
    for (const m of moves) {
      g.move(m); best = Math.min(best, minimax(g, depth-1, alpha, beta, true)); g.undo();
      beta = Math.min(beta, best);
      if (beta <= alpha) break;
    }
    return best;
  }
}

function getBestMove(fen: string, depth: number) {
  const g = new Chess(fen);
  const isWhite = g.turn() === "w";
  const moves = orderMoves(g.moves({ verbose: true }) as any[]);
  if (!moves.length) return null;
  let bestMove: any = null;
  let bestScore = isWhite ? -Infinity : Infinity;
  for (const m of moves) {
    g.move(m);
    const score = minimax(g, depth-1, -Infinity, Infinity, !isWhite);
    g.undo();
    if (isWhite ? score > bestScore : score < bestScore) {
      bestScore = score;
      bestMove = m;
    }
  }
  return bestMove;
}

// ── Tip generator ─────────────────────────────────────────────────────────────

const PIECE_RU: Record<string, string> = {
  k:"Королём", q:"Ферзём", r:"Ладьёй", b:"Слоном", n:"Конём", p:"Пешкой"
};

function generateTip(fenBefore: string, playedFrom: string, playedTo: string, bestMove: any): string {
  const g = new Chess(fenBefore);

  // What did the best move accomplish?
  const gBest = new Chess(fenBefore);
  gBest.move(bestMove);
  if (gBest.isCheckmate()) return "Лучший ход ставил мат прямо здесь!";
  if (gBest.isCheck())     return `${bestMove.san} давал шах и выигрывал темп.`;

  if (bestMove.captured) {
    const val = MAT[bestMove.captured] ?? 0;
    if (val >= 500) return `${bestMove.san} брало ладью — крупный выигрыш материала.`;
    if (val >= 300) return `${bestMove.san} брало фигуру — выгодный размен.`;
    return `${bestMove.san} выигрывало пешку без потерь.`;
  }

  // What was bad about the played move?
  const gPlayed = new Chess(fenBefore);
  gPlayed.move({ from: playedFrom, to: playedTo, promotion: "q" });
  const opponentBest = getBestMove(gPlayed.fen(), 2);
  if (opponentBest?.captured) {
    return `После твоего хода противник мог взять ${PIECE_RU[opponentBest.captured] ?? "фигуру"} ходом ${opponentBest.san}.`;
  }

  if (bestMove.piece === "n") return `Конь на ${bestMove.to} создавал угрозы — центральная позиция.`;
  if (bestMove.flags?.includes("k") || bestMove.flags?.includes("q")) return "Рокировка укрывала короля и активировала ладью.";
  return `Ход ${bestMove.san} давал лучшую позицию по оценке компьютера.`;
}

// ── Single move analysis ──────────────────────────────────────────────────────

function analyzeMove(record: CoachMoveRecord, depth: number): CoachAnalysis | null {
  const g = new Chess(record.fenBefore);
  const isWhite = record.color === "w";

  // Evaluate position after played move
  const played = g.move({ from: record.from, to: record.to, promotion: record.promotion ?? "q" });
  if (!played) return null;
  const evalAfterPlayed = evaluate(g);
  g.undo();

  // Find best move & evaluate after it
  const bestMove = getBestMove(record.fenBefore, depth);
  if (!bestMove) return null;

  // Skip if played move IS the best move (same from/to)
  if (bestMove.from === record.from && bestMove.to === record.to) return null;

  g.move(bestMove);
  const evalAfterBest = evaluate(g);
  g.undo();

  // Eval drop from player's perspective
  const evalDrop = isWhite
    ? evalAfterBest - evalAfterPlayed
    : evalAfterPlayed - evalAfterBest;

  if (evalDrop < 40) return null; // not significant enough

  const type: MistakeType = evalDrop >= 250 ? "blunder" : evalDrop >= 100 ? "mistake" : "inaccuracy";
  const headlines: Record<MistakeType, string> = {
    blunder:     "Грубая ошибка",
    mistake:     "Ошибка",
    inaccuracy:  "Неточность",
  };

  return {
    moveNum:    record.moveNum,
    color:      record.color,
    playedSan:  record.san,
    bestSan:    bestMove.san,
    bestFrom:   bestMove.from,
    bestTo:     bestMove.to,
    evalDrop,
    type,
    headline:   headlines[type],
    tip:        generateTip(record.fenBefore, record.from, record.to, bestMove),
    fenBefore:  record.fenBefore,
  };
}

// ── Main export ───────────────────────────────────────────────────────────────

export function analyzeGame(
  records: CoachMoveRecord[],
  playerColor: "w" | "b",
  depth: number,
  onProgress: (done: number, total: number) => void,
): CoachReport {
  const playerMoves = records.filter(r => r.color === playerColor);
  const analyses: CoachAnalysis[] = [];

  playerMoves.forEach((rec, i) => {
    onProgress(i, playerMoves.length);
    const result = analyzeMove(rec, depth);
    if (result) analyses.push(result);
  });

  onProgress(playerMoves.length, playerMoves.length);

  analyses.sort((a, b) => b.evalDrop - a.evalDrop);
  const top = analyses.slice(0, 5);

  const blunders     = analyses.filter(a => a.type === "blunder").length;
  const mistakes     = analyses.filter(a => a.type === "mistake").length;
  const inaccuracies = analyses.filter(a => a.type === "inaccuracy").length;

  // Accuracy: 100 if no mistakes, drops with each error weighted by severity
  const totalPenalty = blunders * 3 + mistakes * 2 + inaccuracies;
  const accuracy = Math.max(0, Math.round(100 - (totalPenalty / Math.max(playerMoves.length, 1)) * 25));

  return { analyses: top, blunders, mistakes, inaccuracies, accuracy };
}
