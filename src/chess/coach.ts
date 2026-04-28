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
export type GamePhase    = "opening" | "middlegame" | "endgame";
export type TacticType   = "fork" | "hanging" | "capture" | "check" | "promotion" | "castling" | "positional";

export interface CoachAnalysis {
  moveNum:     number;
  color:       "w" | "b";
  playedSan:   string;
  playedFrom:  string;
  playedTo:    string;
  bestSan:     string;
  bestFrom:    string;
  bestTo:      string;
  evalDrop:    number;
  type:        MistakeType;
  headline:    string;
  tip:         string;
  fenBefore:   string;
  phase:       GamePhase;
  tactic:      TacticType;
}

export interface PhaseStats {
  blunders:     number;
  mistakes:     number;
  inaccuracies: number;
  moves:        number;
}

export interface CoachReport {
  analyses:     CoachAnalysis[];
  blunders:     number;
  mistakes:     number;
  inaccuracies: number;
  accuracy:     number;
  phaseStats:   Record<GamePhase, PhaseStats>;
  topTip:       string;
}

// ── Evaluation & minimax ──────────────────────────────────────────────────────

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

function orderMoves(moves: any[]) {
  return [...moves].sort((a: any, b: any) =>
    (b.san?.startsWith("+") || b.san?.startsWith("#") ? 1 : 0) -
    (a.san?.startsWith("+") || a.san?.startsWith("#") ? 1 : 0) ||
    (MAT[b.captured ?? ""] ?? 0) - (MAT[a.captured ?? ""] ?? 0)
  );
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

function getBestMove(fen: string, depth: number): any | null {
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

// ── Helpers ───────────────────────────────────────────────────────────────────

function getPhase(moveNum: number): GamePhase {
  if (moveNum <= 10) return "opening";
  if (moveNum <= 30) return "middlegame";
  return "endgame";
}

const FILES = "abcdefgh";
const PIECE_RU: Record<string, string> = {
  k:"короля", q:"ферзя", r:"ладью", b:"слона", n:"коня", p:"пешку",
};
const PIECE_NAMES: Record<string, string> = {
  k:"Король", q:"Ферзь", r:"Ладья", b:"Слон", n:"Конь", p:"Пешка",
};

// Finds opponent pieces that are undefended (hanging) from the perspective of `attackerColor`
function findHanging(g: Chess, attackerColor: "w" | "b"): { sq: string; type: string; val: number }[] {
  const defenderColor = attackerColor === "w" ? "b" : "w";
  const board = g.board();
  const results: { sq: string; type: string; val: number }[] = [];

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (!p || p.color !== defenderColor || p.type === "k") continue;
      const sq = FILES[c] + (8 - r) as any;
      if (!g.isAttacked(sq, attackerColor)) continue;  // we can't take it
      if (g.isAttacked(sq, defenderColor)) continue;   // it IS defended
      results.push({ sq, type: p.type, val: MAT[p.type] ?? 0 });
    }
  }
  return results.sort((a, b) => b.val - a.val);
}

// Detect if a move creates a fork (attacks 2+ valuable pieces)
function detectFork(fen: string, move: any): boolean {
  const g = new Chess(fen);
  g.move(move);
  const movedPiece = g.get(move.to);
  if (!movedPiece) return false;
  const oppColor = movedPiece.color === "w" ? "b" : "w";
  const board = g.board();
  let attacked = 0;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (!p || p.color !== oppColor) continue;
      if ((MAT[p.type] ?? 0) < 300) continue;
      const sq = FILES[c] + (8 - r) as any;
      if (g.isAttacked(sq, movedPiece.color)) attacked++;
    }
  }
  return attacked >= 2;
}

// ── Tip generator ─────────────────────────────────────────────────────────────

function generateTip(
  fenBefore: string,
  playedFrom: string,
  playedTo: string,
  bestMove: any,
  moveNum: number,
  evalDrop: number,
): { tip: string; tactic: TacticType } {
  const phase = getPhase(moveNum);
  const gBest = new Chess(fenBefore);
  gBest.move(bestMove);

  // 1. Checkmate available
  if (gBest.isCheckmate()) {
    return { tip: `Это был мат! ${bestMove.san} заканчивал партию прямо здесь.`, tactic: "check" };
  }

  // 2. Best move gives check
  if (gBest.isCheck() && !bestMove.captured) {
    return { tip: `${bestMove.san} ставил шах — противник терял темп на защиту короля.`, tactic: "check" };
  }

  // 3. Fork detection
  if (detectFork(fenBefore, bestMove)) {
    const pieceName = PIECE_NAMES[bestMove.piece] ?? "Фигура";
    return { tip: `${pieceName} на ${bestMove.to} создавал вилку — одновременно атаковал несколько ценных фигур.`, tactic: "fork" };
  }

  // 4. Hanging piece missed
  const gBefore = new Chess(fenBefore);
  const hanging = findHanging(gBefore, gBefore.turn());
  if (hanging.length > 0 && bestMove.captured) {
    const h = hanging[0];
    if (h.type === bestMove.captured || h.sq === bestMove.to) {
      return { tip: `${PIECE_NAMES[h.type] ?? "Фигура"} противника на ${h.sq} стояла без защиты. ${bestMove.san} забирала её бесплатно.`, tactic: "hanging" };
    }
  }

  // 5. Material capture
  if (bestMove.captured) {
    const val = MAT[bestMove.captured] ?? 0;
    const pieceName = PIECE_RU[bestMove.captured] ?? "фигуру";
    if (val >= 900) return { tip: `${bestMove.san} выигрывало ферзя! Решающее материальное преимущество.`, tactic: "capture" };
    if (val >= 500) return { tip: `${bestMove.san} брало ладью — крупный выигрыш, особенно если без компенсации.`, tactic: "capture" };
    if (val >= 300) return { tip: `${bestMove.san} забирало ${pieceName} без потерь — конкретная выгода.`, tactic: "capture" };
    return { tip: `${bestMove.san} выигрывало пешку. Небольшой, но реальный материальный плюс.`, tactic: "capture" };
  }

  // 6. Promotion
  if (bestMove.flags?.includes("p")) {
    return { tip: `Пешка могла превратиться ходом ${bestMove.san} — это меняло баланс сил.`, tactic: "promotion" };
  }

  // 7. Castling missed
  if (bestMove.flags?.includes("k") || bestMove.flags?.includes("q")) {
    return { tip: `Рокировка ${bestMove.san} укрывала короля и соединяла ладьи — важный элемент в ${phase === "opening" ? "дебюте" : "миттельшпиле"}.`, tactic: "castling" };
  }

  // 8. Opening principles
  if (phase === "opening") {
    const g = new Chess(fenBefore);
    const piece = g.get(bestMove.from as any);
    if (piece && ["n", "b"].includes(piece.type)) {
      return { tip: `В дебюте важно развивать фигуры. ${bestMove.san} выводило ${PIECE_NAMES[piece.type]?.toLowerCase()} на активное поле.`, tactic: "positional" };
    }
    const center = ["d4","d5","e4","e5"];
    if (center.includes(bestMove.to)) {
      return { tip: `${bestMove.san} контролировало центр — главный принцип дебюта. Без центра сложно атаковать.`, tactic: "positional" };
    }
  }

  // 9. What bad consequence did the played move allow?
  const gPlayed = new Chess(fenBefore);
  gPlayed.move({ from: playedFrom, to: playedTo, promotion: "q" });
  const oppBest = getBestMove(gPlayed.fen(), 2);
  if (oppBest?.captured) {
    const val = MAT[oppBest.captured] ?? 0;
    if (val >= 300) return { tip: `Твой ход оставлял ${PIECE_RU[oppBest.captured] ?? "фигуру"} без защиты — противник мог взять её ходом ${oppBest.san}.`, tactic: "positional" };
  }
  if (oppBest && detectFork(gPlayed.fen(), oppBest)) {
    return { tip: `Твой ход открывал противнику вилку ходом ${oppBest.san}.`, tactic: "positional" };
  }

  // 10. Piece-specific positional hints
  if (bestMove.piece === "n") return { tip: `Конь на ${bestMove.to} занимал сильное поле — поддержку центра и давление на соперника (+${(evalDrop/100).toFixed(1)}♙).`, tactic: "positional" };
  if (bestMove.piece === "r") return { tip: `Ладья на ${bestMove.to} переходила на открытую вертикаль или 7-й ряд — мощная активная позиция.`, tactic: "positional" };
  if (bestMove.piece === "b") return { tip: `Слон на ${bestMove.to} контролировал длинную диагональ (+${(evalDrop/100).toFixed(1)}♙).`, tactic: "positional" };

  return { tip: `Ход ${bestMove.san} давал преимущество в ${(evalDrop/100).toFixed(1)} пешки по оценке движка.`, tactic: "positional" };
}

// ── Single move analysis ──────────────────────────────────────────────────────

function analyzeMove(record: CoachMoveRecord, depth: number): CoachAnalysis | null {
  const g = new Chess(record.fenBefore);
  const isWhite = record.color === "w";

  // Eval after played move
  const played = g.move({ from: record.from, to: record.to, promotion: record.promotion ?? "q" });
  if (!played) return null;
  const evalAfterPlayed = evaluate(g);
  g.undo();

  // Best move
  const bestMove = getBestMove(record.fenBefore, depth);
  if (!bestMove) return null;
  if (bestMove.from === record.from && bestMove.to === record.to) return null;

  g.move(bestMove);
  const evalAfterBest = evaluate(g);
  g.undo();

  const evalDrop = isWhite
    ? evalAfterBest - evalAfterPlayed
    : evalAfterPlayed - evalAfterBest;

  if (evalDrop < 40) return null;

  const type: MistakeType = evalDrop >= 250 ? "blunder" : evalDrop >= 100 ? "mistake" : "inaccuracy";
  const headlines: Record<MistakeType, string> = {
    blunder:    "Грубая ошибка",
    mistake:    "Ошибка",
    inaccuracy: "Неточность",
  };

  const { tip, tactic } = generateTip(record.fenBefore, record.from, record.to, bestMove, record.moveNum, evalDrop);

  return {
    moveNum:    record.moveNum,
    color:      record.color,
    playedSan:  record.san,
    playedFrom: record.from,
    playedTo:   record.to,
    bestSan:    bestMove.san,
    bestFrom:   bestMove.from,
    bestTo:     bestMove.to,
    evalDrop,
    type,
    headline:   headlines[type],
    tip,
    fenBefore:  record.fenBefore,
    phase:      getPhase(record.moveNum),
    tactic,
  };
}

// ── Top tip generator ─────────────────────────────────────────────────────────

function generateTopTip(analyses: CoachAnalysis[], totalMoves: number): string {
  if (analyses.length === 0) return "Отличная партия — серьёзных ошибок не найдено. Продолжай в том же духе!";

  const byPhase = analyses.reduce<Record<string, number>>((acc, a) => {
    acc[a.phase] = (acc[a.phase] ?? 0) + 1;
    return acc;
  }, {});

  const byTactic = analyses.reduce<Record<string, number>>((acc, a) => {
    acc[a.tactic] = (acc[a.tactic] ?? 0) + 1;
    return acc;
  }, {});

  const worstPhase = (Object.entries(byPhase).sort((a, b) => b[1] - a[1])[0]?.[0] as GamePhase) ?? "middlegame";
  const topTactic = Object.entries(byTactic).sort((a, b) => b[1] - a[1])[0]?.[0] as TacticType ?? "positional";

  const phaseAdvice: Record<GamePhase, string> = {
    opening:    "В дебюте старайся развивать фигуры, контролировать центр и делать рокировку до 10-го хода.",
    middlegame: "В миттельшпиле перед каждым ходом спрашивай: «Что угрожает противник? Могу ли я взять что-нибудь?»",
    endgame:    "В эндшпиле активизируй короля и создавай проходные пешки — они решают партию.",
  };

  const tacticAdvice: Record<TacticType, string> = {
    hanging:    "Чаще ищи незащищённые фигуры соперника — это самый прямой способ выиграть материал.",
    fork:       "Практикуй тактику вилок — один ход атакует сразу несколько целей, и противник не успевает защититься.",
    capture:    "Перед ходом сканируй доску на взятия: есть ли что-то, что можно взять без потерь?",
    check:      "Ищи шахи — они выигрывают темп и могут привести к мату или выигрышу материала.",
    promotion:  "В эндшпиле считай, как провести пешку в ферзи — это часто решает партию.",
    castling:   "Делай рокировку пораньше, чтобы защитить короля и соединить ладьи.",
    positional: "Работай над стратегическим мышлением: активизируй фигуры, улучшай их позиции.",
  };

  return phaseAdvice[worstPhase] + " " + tacticAdvice[topTactic];
}

// ── Main export ───────────────────────────────────────────────────────────────

const emptyPhase = (): PhaseStats => ({ blunders: 0, mistakes: 0, inaccuracies: 0, moves: 0 });

export function analyzeGame(
  records: CoachMoveRecord[],
  playerColor: "w" | "b",
  depth: number,
  onProgress: (done: number, total: number) => void,
): CoachReport {
  const playerMoves = records.filter(r => r.color === playerColor);
  const analyses: CoachAnalysis[] = [];
  const phaseStats: Record<GamePhase, PhaseStats> = {
    opening: emptyPhase(), middlegame: emptyPhase(), endgame: emptyPhase(),
  };

  playerMoves.forEach((rec, i) => {
    onProgress(i, playerMoves.length);

    const phase = getPhase(rec.moveNum);
    phaseStats[phase].moves++;

    // Use depth=2 for speed, depth=3 only for already-suspicious positions
    const result = analyzeMove(rec, depth);
    if (result) {
      analyses.push(result);
      phaseStats[result.phase][result.type]++;
    }
  });

  onProgress(playerMoves.length, playerMoves.length);
  analyses.sort((a, b) => b.evalDrop - a.evalDrop);
  const top = analyses.slice(0, 8);

  const blunders     = analyses.filter(a => a.type === "blunder").length;
  const mistakes     = analyses.filter(a => a.type === "mistake").length;
  const inaccuracies = analyses.filter(a => a.type === "inaccuracy").length;

  const totalPenalty = blunders * 3 + mistakes * 2 + inaccuracies;
  const accuracy = Math.max(0, Math.round(100 - (totalPenalty / Math.max(playerMoves.length, 1)) * 22));

  return {
    analyses: top,
    blunders,
    mistakes,
    inaccuracies,
    accuracy,
    phaseStats,
    topTip: generateTopTip(top, playerMoves.length),
  };
}
