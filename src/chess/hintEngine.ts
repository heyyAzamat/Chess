import { Chess, type Move } from "chess.js";

// ── Constants ─────────────────────────────────────────────────────────────────

const MATERIAL: Record<string, number> = {
  p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000,
};

const PIECE_RU: Record<string, string> = {
  k: "Короля", q: "Ферзя", r: "Ладью", b: "Слона", n: "Коня", p: "Пешку",
};

const PIECE_RU_ACC: Record<string, string> = {
  k: "Король", q: "Ферзь", r: "Ладья", b: "Слон", n: "Конь", p: "Пешка",
};

// ── Types ─────────────────────────────────────────────────────────────────────

export interface HintResult {
  from: string;
  to: string;
  promotion?: string;
  icon: string;
  headline: string;
  explanation: string;
  category: "tactic" | "material" | "safety" | "positional";
}

// ── Minimax (same as bot but cleaner, used only for hints at depth 5) ─────────

const PST_P  = [ 0,  0,  0,  0,  0,  0,  0,  0, 50,50,50,50,50,50,50,50, 10,10,20,30,30,20,10,10,  5, 5,10,25,25,10, 5, 5,  0, 0, 0,20,20, 0, 0, 0,  5,-5,-10, 0, 0,-10,-5, 5,  5,10,10,-20,-20,10,10, 5,  0, 0, 0, 0, 0, 0, 0, 0 ];
const PST_N  = [ -50,-40,-30,-30,-30,-30,-40,-50, -40,-20,0,0,0,0,-20,-40, -30,0,10,15,15,10,0,-30, -30,5,15,20,20,15,5,-30, -30,0,15,20,20,15,0,-30, -30,5,10,15,15,10,5,-30, -40,-20,0,5,5,0,-20,-40, -50,-40,-30,-30,-30,-30,-40,-50 ];
const PST_B  = [ -20,-10,-10,-10,-10,-10,-10,-20, -10,0,0,0,0,0,0,-10, -10,0,5,10,10,5,0,-10, -10,5,5,10,10,5,5,-10, -10,0,10,10,10,10,0,-10, -10,10,10,10,10,10,10,-10, -10,5,0,0,0,0,5,-10, -20,-10,-10,-10,-10,-10,-10,-20 ];
const PST_R  = [ 0,0,0,0,0,0,0,0, 5,10,10,10,10,10,10,5, -5,0,0,0,0,0,0,-5, -5,0,0,0,0,0,0,-5, -5,0,0,0,0,0,0,-5, -5,0,0,0,0,0,0,-5, -5,0,0,0,0,0,0,-5, 0,0,0,5,5,0,0,0 ];
const PST_Q  = [ -20,-10,-10,-5,-5,-10,-10,-20, -10,0,0,0,0,0,0,-10, -10,0,5,5,5,5,0,-10, -5,0,5,5,5,5,0,-5, 0,0,5,5,5,5,0,-5, -10,5,5,5,5,5,0,-10, -10,0,5,0,0,0,0,-10, -20,-10,-10,-5,-5,-10,-10,-20 ];
const PST_K  = [ -30,-40,-40,-50,-50,-40,-40,-30, -30,-40,-40,-50,-50,-40,-40,-30, -30,-40,-40,-50,-50,-40,-40,-30, -30,-40,-40,-50,-50,-40,-40,-30, -20,-30,-30,-40,-40,-30,-30,-20, -10,-20,-20,-20,-20,-20,-20,-10, 20,20,0,0,0,0,20,20, 20,30,10,0,0,10,30,20 ];

const PST: Record<string, number[]> = { p: PST_P, n: PST_N, b: PST_B, r: PST_R, q: PST_Q, k: PST_K };

function evaluate(g: Chess): number {
  if (g.isCheckmate()) return g.turn() === "w" ? -50000 : 50000;
  if (g.isDraw()) return 0;
  let score = 0;
  const board = g.board();
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (!p) continue;
      const idx = p.color === "w" ? r * 8 + c : (7 - r) * 8 + c;
      score += (p.color === "w" ? 1 : -1) * ((MATERIAL[p.type] ?? 0) + (PST[p.type]?.[idx] ?? 0));
    }
  }
  return score;
}

function orderMoves(moves: Move[]) {
  return [...moves].sort((a, b) => (MATERIAL[b.captured ?? ""] ?? 0) - (MATERIAL[a.captured ?? ""] ?? 0));
}

function minimax(g: Chess, depth: number, alpha: number, beta: number, max: boolean): number {
  if (depth === 0 || g.isGameOver()) return evaluate(g);
  const moves = orderMoves(g.moves({ verbose: true }));
  if (max) {
    let best = -Infinity;
    for (const m of moves) {
      g.move(m); best = Math.max(best, minimax(g, depth - 1, alpha, beta, false)); g.undo();
      alpha = Math.max(alpha, best);
      if (beta <= alpha) break;
    }
    return best;
  } else {
    let best = Infinity;
    for (const m of moves) {
      g.move(m); best = Math.min(best, minimax(g, depth - 1, alpha, beta, true)); g.undo();
      beta = Math.min(beta, best);
      if (beta <= alpha) break;
    }
    return best;
  }
}

// ── Tactical detectors ─────────────────────────────────────────────────────────

// Переключить чью очередь в FEN (чтобы получить ходы своих фигур после хода)
function flipTurn(fen: string): string {
  const parts = fen.split(" ");
  parts[1] = parts[1] === "w" ? "b" : "w";
  return parts.join(" ");
}

// Возвращает список ценных фигур, которые атакует фигура на square
function getAttackedValuable(g: Chess, square: string, myColor: "w" | "b"): string[] {
  try {
    const flipped = new Chess(flipTurn(g.fen()));
    const attacks = flipped.moves({ square, verbose: true });
    return attacks
      .filter(m => {
        const target = flipped.get(m.to as any);
        return target && target.color !== myColor && (MATERIAL[target.type] ?? 0) >= 300;
      })
      .map(m => {
        const target = flipped.get(m.to as any);
        return PIECE_RU_ACC[target!.type];
      });
  } catch {
    return [];
  }
}

// Проверить, висит ли фигура противника (undefended)
function isUndefended(g: Chess, square: string, enemyColor: "w" | "b"): boolean {
  try {
    // Если убрать фигуру, сколько защитников у этого поля?
    // Упрощение: смотрим, атакует ли поле кто-то из enemy
    const flipped = new Chess(flipTurn(g.fen()));
    const defenders = flipped.moves({ verbose: true }).filter(m => m.to === square);
    return defenders.length === 0;
  } catch {
    return false;
  }
}

// ── Move analyzer ─────────────────────────────────────────────────────────────

function analyzeMove(beforeFen: string, move: Move): Pick<HintResult, "icon" | "headline" | "explanation" | "category"> {
  const after = new Chess(beforeFen);
  after.move(move);
  const myColor = move.color;

  // ── Мат ──
  if (after.isCheckmate()) {
    return {
      icon: "☠", category: "tactic",
      headline: "Мат!",
      explanation: "Этот ход ставит мат — противнику некуда двигаться.",
    };
  }

  // ── Шах с потенциалом мата в 1 ──
  if (after.isCheck()) {
    // Ищем мат в 1 после шаха
    const replies = after.moves({ verbose: true });
    const allMate = replies.every(r => {
      const clone = new Chess(after.fen());
      clone.move(r);
      return clone.isCheckmate();
    });
    if (allMate) {
      return {
        icon: "⚠", category: "tactic",
        headline: "Шах — мат неизбежен",
        explanation: "Любой ответ противника ведёт к мату.",
      };
    }
    return {
      icon: "⚠", category: "tactic",
      headline: "Шах!",
      explanation: "Противник обязан защитить короля — используй это время.",
    };
  }

  // ── Взятие материала ──
  if (move.captured) {
    const capturedVal = MATERIAL[move.captured] ?? 0;
    const movingVal   = MATERIAL[move.piece] ?? 0;
    const pieceName   = PIECE_RU[move.captured] ?? move.captured;

    // Висящая фигура — бесплатное взятие
    if (isUndefended(after, move.to, myColor === "w" ? "b" : "w")) {
      return {
        icon: "⚔", category: "material",
        headline: `Взять ${pieceName} бесплатно`,
        explanation: `${PIECE_RU_ACC[move.captured]} на ${move.to} никем не защищён. Берём материал без потерь.`,
      };
    }

    if (capturedVal > movingVal) {
      return {
        icon: "⚔", category: "material",
        headline: `Выиграть материал`,
        explanation: `Берём ${pieceName} (${capturedVal} очков) своим ${PIECE_RU_ACC[move.piece]} (${movingVal} очков). Чистая прибыль.`,
      };
    }
    if (capturedVal === movingVal) {
      return {
        icon: "⚔", category: "material",
        headline: `Размен`,
        explanation: `Обмениваем равноценные фигуры. Бывает выгодно, если упрощает позицию.`,
      };
    }
    // Невыгодное взятие — возможно тактическое
    return {
      icon: "⚔", category: "tactic",
      headline: `Взять ${pieceName}`,
      explanation: `Жертвуем материал ради тактического преимущества.`,
    };
  }

  // ── Вилка ──
  const attackedAfter = getAttackedValuable(after, move.to, myColor);
  if (attackedAfter.length >= 2) {
    return {
      icon: "⚡", category: "tactic",
      headline: "Вилка!",
      explanation: `${PIECE_RU_ACC[move.piece]} одновременно атакует ${attackedAfter.join(" и ")}. Противник не успеет спасти обоих.`,
    };
  }
  if (attackedAfter.length === 1) {
    return {
      icon: "⚡", category: "tactic",
      headline: `Угроза ${attackedAfter[0]}у`,
      explanation: `Ход создаёт прямую угрозу ${attackedAfter[0].toLowerCase()}у. Противник должен реагировать.`,
    };
  }

  // ── Рокировка ──
  if (move.flags.includes("k") || move.flags.includes("q")) {
    return {
      icon: "🛡", category: "safety",
      headline: "Рокировка",
      explanation: "Укрываем короля и активируем ладью. Классический манёвр — выполни его пока не поздно.",
    };
  }

  // ── Превращение пешки ──
  if (move.promotion) {
    return {
      icon: "♛", category: "tactic",
      headline: "Превращение!",
      explanation: "Пешка достигла последней горизонтали и становится ферзём.",
    };
  }

  // ── Развитие в начале партии ──
  const before = new Chess(beforeFen);
  const moveNum = before.moveNumber();

  if (moveNum <= 10 && (move.piece === "n" || move.piece === "b")) {
    const centerFiles = ["c", "d", "e", "f"];
    const isCenter = centerFiles.includes(move.to[0]) && ["3","4","5","6"].includes(move.to[1]);
    return {
      icon: "◈", category: "positional",
      headline: isCenter ? "Развитие в центр" : "Развитие фигуры",
      explanation: isCenter
        ? `Выводим ${PIECE_RU_ACC[move.piece]} на активную позицию в центре. Контроль центра — ключ к хорошей игре.`
        : `Выводим ${PIECE_RU_ACC[move.piece]} — развитые фигуры = больше возможностей.`,
    };
  }

  // ── Централизация пешки ──
  if (move.piece === "p") {
    const file = move.to[0];
    const isCenter = ["d", "e"].includes(file);
    if (moveNum <= 6 && isCenter) {
      return {
        icon: "◈", category: "positional",
        headline: "Занять центр",
        explanation: `Пешка ${move.from}–${move.to} захватывает пространство в центре. Центральные пешки дают преимущество в начале.`,
      };
    }
    return {
      icon: "→", category: "positional",
      headline: "Продвинуть пешку",
      explanation: `Пешка двигается вперёд, создавая давление и открывая линии.`,
    };
  }

  // ── Активизация ладьи ──
  if (move.piece === "r") {
    return {
      icon: "◈", category: "positional",
      headline: "Активная ладья",
      explanation: `Переводим ладью на более активную позицию. Ладьи сильны на открытых и полуоткрытых вертикалях.`,
    };
  }

  // ── Улучшение позиции ──
  return {
    icon: "◈", category: "positional",
    headline: "Улучшить позицию",
    explanation: `Ход улучшает расположение фигур по оценке компьютера.`,
  };
}

// ── Main export ───────────────────────────────────────────────────────────────

export function getHint(fen: string, depth = 5): HintResult | null {
  const g = new Chess(fen);
  const isWhite = g.turn() === "w";
  const moves = orderMoves(g.moves({ verbose: true }));
  if (moves.length === 0) return null;

  let bestMove: Move | null = null;
  let bestScore = isWhite ? -Infinity : Infinity;

  for (const m of moves) {
    g.move(m);
    const score = minimax(g, depth - 1, -Infinity, Infinity, !isWhite);
    g.undo();
    if (isWhite ? score > bestScore : score < bestScore) {
      bestScore = score;
      bestMove = m;
    }
  }

  if (!bestMove) return null;

  const analysis = analyzeMove(fen, bestMove);

  return {
    from: bestMove.from,
    to: bestMove.to,
    promotion: bestMove.promotion,
    ...analysis,
  };
}
