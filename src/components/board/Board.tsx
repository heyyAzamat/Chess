import { useState, useCallback, useRef, useEffect } from "react";
import { Chess, type Square } from "chess.js";
import { ChessPiece } from "../pieces/ChessPiece";
import { PromotionPicker } from "./PromotionPicker";
import { GameHUD } from "./GameHUD";
import { getBotMove } from "../../chess/bot";
import type { HintResult } from "../../chess/hintEngine";
import HintWorker from "../../chess/hintWorker?worker";
import { getPieceCharacter, getRandomCaptureText } from "../../narrative/narrative.service";
import { soundEngine } from "../../services/soundEngine";
import type { PieceType, ChessColor } from "../../narrative/narrative.types";
import type { CoachMoveRecord } from "../../chess/coach";
import styles from "./Board.module.css";

export type GameMode = "bot" | "training" | "multiplayer";

const PIECE_MAP: Record<string, PieceType> = {
  k: "king", q: "queen", r: "rook", b: "bishop", n: "knight", p: "pawn",
};
const COLOR_MAP: Record<string, ChessColor> = { w: "white", b: "black" };

const RANKS = [8, 7, 6, 5, 4, 3, 2, 1];
const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"] as const;

const BOT_DEPTH: Record<string, number> = { easy: 1, medium: 3, hard: 4 };

interface CapturedEntry { type: PieceType; color: ChessColor }

export type BoardEvent =
  | "start" | "move" | "capture" | "check" | "checkmate"
  | "first_capture_player" | "first_capture_opponent"
  | "castling" | "check_given" | "check_received"
  | "pawn_promotion_player" | "pawn_promotion_opponent"
  | "knight_strike";

interface Props {
  mode?: GameMode;
  difficulty?: string;
  playerColor?: ChessColor;
  onGameEvent?: (event: BoardEvent, moveNum: number) => void;
  onQueenCaptured?: () => void;
  onCheckmate?: () => void;
  onPieceSelect?: (color: ChessColor, type: PieceType) => void;
  onGameOver?: (status: "checkmate" | "stalemate" | "draw", moveCount: number, winner: "player" | "opponent" | "draw", history: CoachMoveRecord[]) => void;
}

type GameStatus = "playing" | "check" | "checkmate" | "stalemate" | "draw";

export function Board({
  mode = "bot",
  difficulty = "medium",
  playerColor = "white",
  onGameEvent,
  onQueenCaptured,
  onCheckmate,
  onPieceSelect,
  onGameOver,
}: Props) {
  const [game, setGame]             = useState(() => new Chess());
  const [selected, setSelected]     = useState<Square | null>(null);
  const [validMoves, setValidMoves] = useState<Set<Square>>(new Set());
  const [lastMove, setLastMove]     = useState<{ from: Square; to: Square } | null>(null);
  const [botThinking, setBotThinking] = useState(false);
  const [captured, setCaptured]     = useState<CapturedEntry[]>([]);
  const [lastEvent, setLastEvent]   = useState<string | null>(null);
  const [gameStatus, setGameStatus] = useState<GameStatus>("playing");
  const [pendingPromotion, setPendingPromotion] = useState<{ from: Square; to: Square } | null>(null);
  const [moveCount, setMoveCount]   = useState(0);
  const firstCaptureRef             = useRef(false);
  const knightStrikeRef             = useRef(false);
  const hintWorkerRef               = useRef<Worker | null>(null);
  const moveHistoryRef              = useRef<CoachMoveRecord[]>([]);

  // Training mode extras
  const [hintSquare, setHintSquare]   = useState<Square | null>(null);
  const [hintLoading, setHintLoading] = useState(false);
  const [hintResult, setHintResult]   = useState<HintResult | null>(null);
  const [allMovesFor, setAllMovesFor] = useState<Square | null>(null);

  const isTraining    = mode === "training";
  const isMultiplayer = mode === "multiplayer";
  const isBot         = mode === "bot";

  // In multiplayer both colors are "player"
  const playerColorCh = playerColor === "white" ? "w" : "b";
  const depth = BOT_DEPTH[difficulty] ?? 3;

  function resolveStatus(g: Chess): GameStatus {
    if (g.isCheckmate()) return "checkmate";
    if (g.isStalemate()) return "stalemate";
    if (g.isDraw())      return "draw";
    if (g.isCheck())     return "check";
    return "playing";
  }

  function captureEvent(pieceType: string, pieceColor: string) {
    const victimColor = pieceColor === "w" ? "white" : "black";
    const pt = PIECE_MAP[pieceType];
    const victim = getPieceCharacter(victimColor, pt);
    const name = victim.name ?? victim.names?.[0] ?? pt;
    setLastEvent(`«${name}» повержен. ${getRandomCaptureText(pt)}`);
  }

  const runBotMove = useCallback((fen: string, currentCount: number) => {
    setBotThinking(true);
    const thinkTime = isTraining ? 600 : 400 + Math.random() * 300;
    setTimeout(() => {
      const botMove = getBotMove(fen, isTraining ? 1 : depth);
      if (!botMove) { setBotThinking(false); return; }

      const g = new Chess(fen);
      g.move(botMove);
      const status = resolveStatus(g);
      const newCount = currentCount + 1;

      setGame(g);
      setLastMove({ from: botMove.from as Square, to: botMove.to as Square });
      setMoveCount(newCount);
      setGameStatus(status);
      setHintSquare(null);
      setHintResult(null);
      setBotThinking(false);

      // ── Track move for coach ──
      moveHistoryRef.current.push({
        fenBefore: fen,
        san: botMove.san,
        from: botMove.from,
        to: botMove.to,
        promotion: botMove.promotion,
        moveNum: Math.ceil(newCount / 2),
        color: botMove.color,
      });

      // ── Sounds ──
      if (status === "checkmate") soundEngine.play("checkmate");
      else if (status === "check") soundEngine.play("check");
      else if (botMove.captured) soundEngine.play("capture");
      else if (botMove.flags.includes("k") || botMove.flags.includes("q")) soundEngine.play("castling");
      else if (botMove.promotion) soundEngine.play("promotion");
      else soundEngine.play("move");

      if (botMove.captured) {
        const pt = PIECE_MAP[botMove.captured];
        setCaptured(prev => {
          if (!firstCaptureRef.current) {
            firstCaptureRef.current = true;
            onGameEvent?.("first_capture_opponent", newCount);
          }
          return [...prev, { type: pt, color: COLOR_MAP[playerColorCh] }];
        });
        captureEvent(botMove.captured, playerColorCh);
        if (pt === "queen") { onQueenCaptured?.(); onGameEvent?.("check", newCount); }
        onGameEvent?.("capture", newCount);
      } else {
        setLastEvent(null);
        // Castling
        if (botMove.flags.includes("k") || botMove.flags.includes("q")) {
          onGameEvent?.("castling", newCount);
        }
        // Promotion
        if (botMove.promotion) onGameEvent?.("pawn_promotion_opponent", newCount);
        // Knight move
        if (botMove.piece === "n" && !knightStrikeRef.current) {
          knightStrikeRef.current = true;
          onGameEvent?.("knight_strike", newCount);
        }
        onGameEvent?.("move", newCount);
      }
      if (status === "check") onGameEvent?.("check_received", newCount);
      // Bot just moved → if checkmate, opponent (bot) won
      if (status === "checkmate") { onCheckmate?.(); onGameOver?.("checkmate", newCount, isMultiplayer ? "opponent" : "opponent", moveHistoryRef.current); }
      if (status === "stalemate") onGameOver?.("stalemate", newCount, "draw", moveHistoryRef.current);
      if (status === "draw")      onGameOver?.("draw", newCount, "draw", moveHistoryRef.current);
    }, thinkTime);
  }, [depth, isTraining, playerColorCh, onGameEvent, onQueenCaptured, onCheckmate, onGameOver]);

  function executeMove(from: Square, to: Square, promotion?: "q"|"r"|"b"|"n") {
    const newGame = new Chess(game.fen());
    const move = newGame.move({ from, to, promotion: promotion ?? "q" });
    if (!move) return;

    const status = resolveStatus(newGame);
    const newCount = moveCount + 1;
    const movedColor = move.color; // who just moved

    setGame(newGame);
    setSelected(null);
    setValidMoves(new Set());
    setLastMove({ from, to });
    setMoveCount(newCount);
    setGameStatus(status);
    setPendingPromotion(null);
    setHintSquare(null);

    // ── Track move for coach ──
    moveHistoryRef.current.push({
      fenBefore: game.fen(), // captured before newGame.move() was called
      san: move.san,
      from: move.from,
      to: move.to,
      promotion: move.promotion,
      moveNum: Math.ceil(newCount / 2),
      color: move.color,
    });

    // ── Sounds ──
    if (status === "checkmate") soundEngine.play("checkmate");
    else if (status === "check") soundEngine.play("check");
    else if (move.captured) soundEngine.play("capture");
    else if (move.flags.includes("k") || move.flags.includes("q")) soundEngine.play("castling");
    else if (move.promotion) soundEngine.play("promotion");
    else soundEngine.play("move");

    if (move.captured) {
      const pt = PIECE_MAP[move.captured];
      const victimColor = COLOR_MAP[movedColor === "w" ? "b" : "w"];
      setCaptured(prev => {
        if (!firstCaptureRef.current) {
          firstCaptureRef.current = true;
          onGameEvent?.("first_capture_player", newCount);
        }
        return [...prev, { type: pt, color: victimColor }];
      });
      captureEvent(move.captured, movedColor === "w" ? "b" : "w");
      if (pt === "queen") { onQueenCaptured?.(); }
      onGameEvent?.("capture", newCount);
    } else {
      setLastEvent(null);
      // Castling
      if (move.flags.includes("k") || move.flags.includes("q")) {
        onGameEvent?.("castling", newCount);
      }
      // Promotion
      if (move.promotion) onGameEvent?.("pawn_promotion_player", newCount);
      // Knight move (fire once)
      if (move.piece === "n" && !knightStrikeRef.current) {
        knightStrikeRef.current = true;
        onGameEvent?.("knight_strike", newCount);
      }
      onGameEvent?.("move", newCount);
    }
    if (status === "check") onGameEvent?.("check_given", newCount);

    // Player just moved → if checkmate, player won
    if (status === "checkmate") { onCheckmate?.(); onGameOver?.("checkmate", newCount, "player", moveHistoryRef.current); return; }
    if (status === "stalemate") { onGameOver?.("stalemate", newCount, "draw", moveHistoryRef.current); return; }
    if (status === "draw")      { onGameOver?.("draw", newCount, "draw", moveHistoryRef.current); return; }

    // Bot responds only in bot/training modes
    if (isBot || isTraining) {
      runBotMove(newGame.fen(), newCount);
    }
  }

  function isMyTurn(sq: Square): boolean {
    const piece = game.get(sq);
    if (!piece) return false;
    if (isMultiplayer) return piece.color === game.turn(); // both players
    return piece.color === playerColorCh && game.turn() === playerColorCh;
  }

  function handleSquareClick(sq: Square) {
    if (gameStatus === "checkmate" || gameStatus === "stalemate" || gameStatus === "draw") return;
    if (botThinking) return;
    // In bot/training mode, only act on player's turn
    if ((isBot || isTraining) && game.turn() !== playerColorCh) return;

    const piece = game.get(sq);

    if (selected) {
      if (validMoves.has(sq)) {
        const movingPiece = game.get(selected);
        const isPromotion =
          movingPiece?.type === "p" &&
          ((game.turn() === "w" && sq[1] === "8") ||
           (game.turn() === "b" && sq[1] === "1"));

        if (isPromotion) {
          setPendingPromotion({ from: selected, to: sq });
          setSelected(null);
          setValidMoves(new Set());
        } else {
          executeMove(selected, sq);
        }
      } else if (piece && isMyTurn(sq)) {
        selectSquare(sq);
        onPieceSelect?.(COLOR_MAP[piece.color], PIECE_MAP[piece.type]);
      } else {
        setSelected(null);
        setValidMoves(new Set());
      }
    } else {
      if (piece && isMyTurn(sq)) {
        selectSquare(sq);
        onPieceSelect?.(COLOR_MAP[piece.color], PIECE_MAP[piece.type]);
      }
    }
  }

  function selectSquare(sq: Square) {
    const moves = game.moves({ square: sq, verbose: true });
    setSelected(sq);
    setValidMoves(new Set(moves.map(m => m.to as Square)));
    setHintSquare(null);
  }

  // Training: smart hint via Web Worker (non-blocking, depth 5)
  function requestHint() {
    if (hintLoading || botThinking) return;

    // Terminate any previous computation
    hintWorkerRef.current?.terminate();

    setHintLoading(true);
    setHintResult(null);

    const worker = new HintWorker();
    hintWorkerRef.current = worker;
    const fen = game.fen();

    worker.onmessage = (e: MessageEvent<HintResult | null>) => {
      worker.terminate();
      hintWorkerRef.current = null;
      const hint = e.data;
      if (hint) {
        // Re-read moves from the same FEN (game state may have changed)
        const g = new Chess(fen);
        setSelected(hint.from as Square);
        setValidMoves(new Set(g.moves({ square: hint.from as Square, verbose: true }).map((m: any) => m.to as Square)));
        setHintSquare(hint.to as Square);
        setHintResult(hint);
      }
      setHintLoading(false);
    };

    worker.onerror = () => {
      worker.terminate();
      hintWorkerRef.current = null;
      setHintLoading(false);
    };

    worker.postMessage({ fen, depth: 5 });
  }

  // Training: hover shows moves for any own piece
  function handleSquareHover(sq: Square) {
    if (!isTraining) return;
    const piece = game.get(sq);
    if (piece && piece.color === playerColorCh && !selected) {
      setAllMovesFor(sq);
    } else {
      setAllMovesFor(null);
    }
  }

  function handleNewGame() {
    hintWorkerRef.current?.terminate();
    hintWorkerRef.current = null;
    firstCaptureRef.current = false;
    knightStrikeRef.current = false;
    setGame(new Chess());
    setSelected(null);
    setValidMoves(new Set());
    setLastMove(null);
    setBotThinking(false);
    setCaptured([]);
    setLastEvent(null);
    setGameStatus("playing");
    setPendingPromotion(null);
    setMoveCount(0);
    setHintSquare(null);
    onGameEvent?.("start", 0);
  }

  // Terminate hint worker on unmount
  useEffect(() => () => { hintWorkerRef.current?.terminate(); }, []);

  const didInit = useRef(false);
  useEffect(() => {
    if (!didInit.current && isBot && playerColor === "black") {
      didInit.current = true;
      runBotMove(game.fen(), 0);
    } else {
      didInit.current = true;
    }
  }, []);

  // Hover valid moves (training only) — moves for hovered piece
  const hoverMoves = allMovesFor && !selected
    ? new Set(game.moves({ square: allMovesFor, verbose: true }).map(m => m.to as Square))
    : new Set<Square>();

  function isKingInCheck(sq: Square): boolean {
    if (gameStatus !== "check" && gameStatus !== "checkmate") return false;
    const piece = game.get(sq);
    return piece?.type === "k" && piece.color === game.turn();
  }

  // Whose turn label for multiplayer
  const multiTurnColor: ChessColor = game.turn() === "w" ? "white" : "black";

  return (
    <div className={styles.gameWrap}>
      <GameHUD
        turn={game.turn()}
        botThinking={botThinking}
        moveCount={moveCount}
        captured={captured}
        lastEvent={lastEvent}
        gameStatus={gameStatus}
        playerColor={playerColor}
        mode={mode}
        multiTurnColor={multiTurnColor}
        onNewGame={handleNewGame}
      />

      {/* Training hint bar */}
      {isTraining && (
        <div className={styles.hintBar}>
          <div className={styles.hintTopRow}>
            <button
              className={styles.hintBtn}
              onClick={requestHint}
              disabled={hintLoading || botThinking || (gameStatus !== "playing" && gameStatus !== "check")}
            >
              {hintLoading ? "АНАЛИЗИРУЮ..." : "◌ ПОДСКАЗКА"}
            </button>
            <span className={styles.hintNote}>Наведи на фигуру — увидишь ходы</span>
          </div>

          {hintResult && (
            <div className={styles.hintExplanation}>
              <span className={styles.hintIcon}>{hintResult.icon}</span>
              <div className={styles.hintTextBlock}>
                <span className={styles.hintHeadline}>{hintResult.headline}</span>
                <span className={styles.hintExplainText}>{hintResult.explanation}</span>
              </div>
              <span
                className={styles.hintCategory}
                style={{
                  color:
                    hintResult.category === "tactic"    ? "#FF6B1A" :
                    hintResult.category === "material"  ? "#FFEE00" :
                    hintResult.category === "safety"    ? "#4A90D9" :
                    "#888",
                }}
              >
                {hintResult.category === "tactic"    ? "ТАКТИКА"   :
                 hintResult.category === "material"  ? "МАТЕРИАЛ"  :
                 hintResult.category === "safety"    ? "БЕЗОПАСНОСТЬ" :
                 "ПОЗИЦИЯ"}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Multiplayer turn banner */}
      {isMultiplayer && gameStatus !== "checkmate" && gameStatus !== "stalemate" && (
        <div
          className={styles.multiTurnBanner}
          style={{
            color: multiTurnColor === "white" ? "#4A90D9" : "#FF2D78",
            borderColor: multiTurnColor === "white" ? "#4A90D944" : "#FF2D7844",
          }}
        >
          {multiTurnColor === "white" ? "◈ АВРОРА" : "◈ НОВА"} — ТВОЙ ХОД
        </div>
      )}

      <div className={styles.boardWrap}>
        <div className={styles.rankLabels}>
          {RANKS.map(r => <span key={r} className={styles.rankLabel}>{r}</span>)}
        </div>

        <div className={styles.board}>
          {RANKS.map(rank =>
            FILES.map(file => {
              const sq = `${file}${rank}` as Square;
              const piece = game.get(sq);
              const isLight = (rank + file.charCodeAt(0)) % 2 === 1;
              const isSel = selected === sq;
              const isValid = validMoves.has(sq);
              const isHoverValid = hoverMoves.has(sq);
              const isHint = hintSquare === sq;
              const isLast = lastMove?.from === sq || lastMove?.to === sq;
              const inCheck = isKingInCheck(sq);
              const hasPiece = !!piece;

              return (
                <div
                  key={sq}
                  className={[
                    styles.square,
                    isLight ? styles.squareLight : styles.squareDark,
                    isSel        ? styles.squareSel    : "",
                    isLast       ? styles.squareLast   : "",
                    inCheck      ? styles.squareCheck  : "",
                    isHint       ? styles.squareHint   : "",
                    isHoverValid ? styles.squareHover  : "",
                  ].join(" ")}
                  onClick={() => handleSquareClick(sq)}
                  onMouseEnter={() => handleSquareHover(sq)}
                  onMouseLeave={() => setAllMovesFor(null)}
                >
                  {piece && (
                    <ChessPiece
                      type={PIECE_MAP[piece.type]}
                      color={COLOR_MAP[piece.color]}
                      size={60}
                      glowIntensity={isSel ? "high" : "low"}
                      selected={isSel}
                    />
                  )}
                  {(isValid || isHoverValid) && !hasPiece && (
                    <div className={isHint ? styles.hintDot : styles.moveDot} />
                  )}
                  {(isValid || isHoverValid) && hasPiece && !isSel && (
                    <div className={isHint ? styles.hintRing : styles.captureRing} />
                  )}
                </div>
              );
            })
          )}
        </div>

        <div className={styles.fileLabels}>
          {FILES.map(f => <span key={f} className={styles.fileLabel}>{f}</span>)}
        </div>
      </div>

      {pendingPromotion && (
        <PromotionPicker
          color={isMultiplayer ? multiTurnColor : playerColor}
          onPick={sym => executeMove(pendingPromotion.from, pendingPromotion.to, sym)}
        />
      )}
    </div>
  );
}
