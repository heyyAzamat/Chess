import { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { type Square } from "chess.js";
import { useAuth } from "../contexts/AuthContext";
import { useOnlineGame } from "../hooks/useOnlineGame";
import { ChessPiece } from "../components/pieces/ChessPiece";
import { ResultModal, type ResultData } from "../components/ResultModal/ResultModal";
import { soundEngine } from "../services/soundEngine";
import type { PieceType, ChessColor } from "../narrative/narrative.types";
import s from "./OnlinePage.module.css";

const PIECE_MAP: Record<string, PieceType> = {
  k: "king", q: "queen", r: "rook", b: "bishop", n: "knight", p: "pawn",
};
const COLOR_MAP: Record<string, ChessColor> = { w: "white", b: "black" };
const RANKS = [8,7,6,5,4,3,2,1];
const FILES = ["a","b","c","d","e","f","g","h"] as const;

export function OnlinePage() {
  const navigate = useNavigate();
  const { user, updateStats } = useAuth();
  const [joinCode, setJoinCode] = useState("");
  const [selected, setSelected] = useState<Square | null>(null);
  const prevFen = useRef<string>("");
  const [validMoves, setValidMoves] = useState<Set<Square>>(new Set());
  const [pendingPromotion, setPendingPromotion] = useState<{ from: Square; to: Square } | null>(null);
  const [onlineEloDelta, setOnlineEloDelta]   = useState<number | null>(null);
  const [onlineNewRating, setOnlineNewRating] = useState<number | null>(null);

  const {
    phase, roomCode, myColor, opponentName, gameState, gameOver,
    error, connected, drawOffered, isMyTurn, localGame,
    createRoom, joinRoom, sendMove, resign, offerDraw, acceptDraw, declineDraw,
    resetToLobby,
  } = useOnlineGame(user?.username ?? "Аноним");

  // Sound on opponent move (FEN changed, not my turn)
  useEffect(() => {
    if (!gameState || gameState.fen === prevFen.current) return;
    const isOpponentMove = !isMyTurn; // after server sends state, turn switches
    prevFen.current = gameState.fen;
    if (gameState.mate) soundEngine.play("checkmate");
    else if (gameState.check) soundEngine.play("check");
    else if (isOpponentMove) soundEngine.play("move");
  }, [gameState, isMyTurn]);

  // Sound + ELO on game over
  useEffect(() => {
    if (!gameOver || phase !== "over") return;
    const iWin = (gameOver.result === "white_wins" && myColor === "white") ||
                 (gameOver.result === "black_wins" && myColor === "black");
    const isDraw = gameOver.result === "draw";
    const outcome: "win" | "loss" | "draw" = isDraw ? "draw" : iWin ? "win" : "loss";

    setTimeout(() => soundEngine.play(isDraw ? "draw" : iWin ? "victory" : "defeat"), 600);

    // Real ELO vs human — assume opponent ~same rating or default 1200
    const opponentRating = 1200; // could be passed from server in future
    const eloResult = updateStats(outcome, opponentRating);
    setOnlineEloDelta(eloResult.delta);
    setOnlineNewRating(eloResult.newRating);
  }, [gameOver, phase, myColor, updateStats]);

  function handleSquareClick(sq: Square) {
    if (!isMyTurn || !localGame || gameState?.over) return;
    const myColorCh = myColor === "white" ? "w" : "b";
    const piece = localGame.get(sq);

    if (selected) {
      if (validMoves.has(sq)) {
        const movingPiece = localGame.get(selected);
        const isPromotion =
          movingPiece?.type === "p" &&
          ((myColor === "white" && sq[1] === "8") ||
           (myColor === "black" && sq[1] === "1"));
        if (isPromotion) {
          setPendingPromotion({ from: selected, to: sq });
          setSelected(null);
          setValidMoves(new Set());
        } else {
          // Play move sound before sending
          const hasCap = !!localGame?.get(sq);
          soundEngine.play(hasCap ? "capture" : "move");
          sendMove(selected, sq);
          setSelected(null);
          setValidMoves(new Set());
        }
      } else if (piece?.color === myColorCh) {
        doSelect(sq);
      } else {
        setSelected(null);
        setValidMoves(new Set());
      }
    } else {
      if (piece?.color === myColorCh) doSelect(sq);
    }
  }

  function doSelect(sq: Square) {
    if (!localGame) return;
    const moves = localGame.moves({ square: sq, verbose: true });
    setSelected(sq);
    setValidMoves(new Set(moves.map(m => m.to as Square)));
  }

  function handlePromotion(sym: "q"|"r"|"b"|"n") {
    if (!pendingPromotion) return;
    sendMove(pendingPromotion.from, pendingPromotion.to, sym);
    setPendingPromotion(null);
  }

  function isKingInCheck(sq: Square) {
    if (!gameState?.check && !gameState?.mate) return false;
    const piece = localGame?.get(sq);
    return piece?.type === "k" && piece.color === localGame?.turn();
  }

  // ── Render board orientation (flip for black) ─────────────────────────────
  const ranks = myColor === "white" ? RANKS : [...RANKS].reverse();
  const files = myColor === "white" ? FILES : [...FILES].reverse() as typeof FILES;

  // ── LOBBY phase ───────────────────────────────────────────────────────────
  if (phase === "lobby") {
    return (
      <div className={s.page}>
        <header className={s.header}>
          <button className={s.backBtn} onClick={() => navigate("/play")}>← НАЗАД</button>
          <h1 className={s.title}>ОНЛАЙН</h1>
          <div className={s.connDot} style={{ background: connected ? "#4caf50" : "#FF2D78" }}
            title={connected ? "Подключено" : "Отключено"} />
        </header>

        <main className={s.lobby}>
          <div className={s.lobbyCard}>
            <h2 className={s.lobbyCardTitle} style={{ color: "#4A90D9" }}>СОЗДАТЬ КОМНАТУ</h2>
            <p className={s.lobbyCardDesc}>Создай комнату и поделись кодом с другом</p>
            <button className={s.lobbyBtn} style={{ "--lc": "#4A90D9" } as React.CSSProperties}
              onClick={createRoom} disabled={!connected}>
              СОЗДАТЬ →
            </button>
          </div>

          <div className={s.lobbyDivider}>ИЛИ</div>

          <div className={s.lobbyCard}>
            <h2 className={s.lobbyCardTitle} style={{ color: "#FF2D78" }}>ВОЙТИ В КОМНАТУ</h2>
            <p className={s.lobbyCardDesc}>Введи код комнаты от друга</p>
            <input
              className={s.codeInput}
              type="text"
              value={joinCode}
              onChange={e => setJoinCode(e.target.value.toUpperCase())}
              placeholder="NOVA-1234"
              maxLength={12}
              onKeyDown={e => e.key === "Enter" && joinRoom(joinCode)}
            />
            <button
              className={s.lobbyBtn}
              style={{ "--lc": "#FF2D78" } as React.CSSProperties}
              onClick={() => joinRoom(joinCode)}
              disabled={!connected || joinCode.length < 5}
            >
              ВОЙТИ →
            </button>
          </div>

          {!connected && (
            <p className={s.errorMsg}>⚠ Подключение к серверу...</p>
          )}
          {error && <p className={s.errorMsg}>⚠ {error}</p>}
        </main>
      </div>
    );
  }

  // ── WAITING phase ─────────────────────────────────────────────────────────
  if (phase === "waiting") {
    return (
      <div className={s.page}>
        <header className={s.header}>
          <button className={s.backBtn} onClick={resetToLobby}>← ВЫЙТИ</button>
          <h1 className={s.title}>ОЖИДАНИЕ</h1>
          <div />
        </header>
        <main className={s.waiting}>
          <div className={s.waitingPulse} />
          <h2 className={s.waitingTitle}>КОД КОМНАТЫ</h2>
          <div className={s.codeDisplay}>
            <span className={s.codeText}>{roomCode}</span>
            <button className={s.copyBtn} onClick={() => navigator.clipboard.writeText(roomCode)}>
              КОПИРОВАТЬ
            </button>
          </div>
          <p className={s.waitingDesc}>
            Отправь этот код другу.<br />
            Ты играешь за <span style={{ color: myColor === "white" ? "#4A90D9" : "#FF2D78" }}>
              {myColor === "white" ? "АВРОРУ" : "НОВУ"}
            </span>.
          </p>
          <div className={s.waitingDots}>
            <span /><span /><span />
          </div>
        </main>
      </div>
    );
  }

  // ── OVER phase banner ─────────────────────────────────────────────────────
  const overBanner = (() => {
    if (phase !== "over" || !gameOver) return null;
    const iWin =
      (gameOver.result === "white_wins" && myColor === "white") ||
      (gameOver.result === "black_wins" && myColor === "black");
    const isDraw = gameOver.result === "draw";
    const reasonText: Record<string, string> = {
      checkmate: "шахмат",
      resign: "сдача",
      stalemate: "пат",
      agreement: "договорная ничья",
      draw: "ничья",
    };
    return {
      text: isDraw ? "НИЧЬЯ" : iWin ? "ПОБЕДА" : "ПОРАЖЕНИЕ",
      sub: reasonText[gameOver.reason] ?? "",
      color: isDraw ? "#888" : iWin ? "#FFEE00" : "#FF2D78",
    };
  })();

  // ── PLAYING / OVER with board ─────────────────────────────────────────────
  return (
    <div className={s.page}>
      <header className={s.header}>
        <button className={s.backBtn} onClick={resetToLobby}>← ВЫЙТИ</button>
        <div className={s.headerCenter}>
          <span className={s.roomCodeSmall}>{roomCode}</span>
          <span className={s.connectionBadge} style={{ color: connected ? "#4caf50" : "#FF2D78" }}>
            {connected ? "● ОНЛАЙН" : "○ ОБРЫВ"}
          </span>
        </div>
        <div />
      </header>

      {/* Players strip */}
      <div className={s.playersStrip}>
        <div className={s.player} style={{ opacity: isMyTurn ? 1 : 0.45 }}>
          <div className={s.playerDot} style={{ background: myColor === "white" ? "#4A90D9" : "#FF2D78" }} />
          <span className={s.playerName}>{user?.username ?? "Вы"}</span>
          <span className={s.playerFaction} style={{ color: myColor === "white" ? "#4A90D9" : "#FF2D78" }}>
            {myColor === "white" ? "АВРОРА" : "НОВА"}
          </span>
          {isMyTurn && <span className={s.turnArrow}>▶</span>}
        </div>

        <div className={s.playersMid}>
          {gameState && (
            <span className={s.moveCounter}>
              {Math.ceil((localGame?.moveNumber() ?? 1) / 1)} ХОД
            </span>
          )}
        </div>

        <div className={s.player} style={{ justifyContent: "flex-end", opacity: !isMyTurn && phase === "playing" ? 1 : 0.45 }}>
          {!isMyTurn && phase === "playing" && <span className={s.turnArrow} style={{ transform: "scaleX(-1)" }}>▶</span>}
          <span className={s.playerFaction} style={{
            color: myColor === "white" ? "#FF2D78" : "#4A90D9", textAlign: "right"
          }}>
            {myColor === "white" ? "НОВА" : "АВРОРА"}
          </span>
          <span className={s.playerName}>{opponentName || "Соперник"}</span>
          <div className={s.playerDot} style={{ background: myColor === "white" ? "#FF2D78" : "#4A90D9" }} />
        </div>
      </div>

      {/* Status bar */}
      {gameState && (
        <div className={s.statusBar} style={{
          color: overBanner?.color ?? (
            gameState.check ? "#FF6B1A" :
            isMyTurn ? (myColor === "white" ? "#4A90D9" : "#FF2D78") : "#555"
          )
        }}>
          {overBanner
            ? `${overBanner.text} · ${overBanner.sub}`
            : gameState.check
              ? "⚠ ШАХ"
              : isMyTurn ? "▶ ВАШ ХОД" : "● ЖДЁМ СОПЕРНИКА..."}
        </div>
      )}

      {error && <div className={s.errorBar}>⚠ {error}</div>}

      {/* Draw offer banner */}
      {drawOffered && (
        <div className={s.drawBanner}>
          <span>Соперник предлагает ничью</span>
          <button className={s.drawAccept} onClick={acceptDraw}>ПРИНЯТЬ</button>
          <button className={s.drawDecline} onClick={declineDraw}>ОТКЛОНИТЬ</button>
        </div>
      )}

      {/* Board */}
      {gameState && (
        <div className={s.boardArea}>
          <div className={s.rankLabels}>
            {ranks.map(r => <span key={r} className={s.rankLabel}>{r}</span>)}
          </div>

          <div className={s.board}>
            {ranks.map(rank =>
              files.map(file => {
                const sq = `${file}${rank}` as Square;
                const piece = localGame?.get(sq);
                const isLight = (rank + file.charCodeAt(0)) % 2 === 1;
                const isSel = selected === sq;
                const isValid = validMoves.has(sq);
                const inCheck = isKingInCheck(sq);
                const hasPiece = !!piece;

                return (
                  <div
                    key={sq}
                    className={[
                      s.square,
                      isLight ? s.squareLight : s.squareDark,
                      isSel   ? s.squareSel   : "",
                      inCheck ? s.squareCheck : "",
                      isValid && !hasPiece ? s.squareMove : "",
                      isValid &&  hasPiece ? s.squareCap  : "",
                    ].join(" ")}
                    onClick={() => handleSquareClick(sq)}
                  >
                    {piece && (
                      <ChessPiece
                        type={PIECE_MAP[piece.type]}
                        color={COLOR_MAP[piece.color]}
                        size={58}
                        glowIntensity={isSel ? "high" : "low"}
                        selected={isSel}
                      />
                    )}
                    {isValid && !hasPiece && <div className={s.dot} />}
                    {isValid &&  hasPiece && !isSel && <div className={s.capRing} />}
                  </div>
                );
              })
            )}
          </div>

          <div className={s.fileLabels}>
            {files.map(f => <span key={f} className={s.fileLabel}>{f}</span>)}
          </div>
        </div>
      )}

      {/* Waiting for game start */}
      {!gameState && phase === "playing" && (
        <div className={s.waitingInGame}>Ожидание первого хода...</div>
      )}

      {/* Action buttons */}
      {phase === "playing" && (
        <div className={s.actions}>
          <button className={s.actionBtn} style={{ "--ab": "#888" } as React.CSSProperties} onClick={offerDraw}>
            НИЧЬЯ?
          </button>
          <button className={s.actionBtn} style={{ "--ab": "#FF2D78" } as React.CSSProperties} onClick={resign}>
            СДАТЬСЯ
          </button>
        </div>
      )}

      {phase === "over" && gameOver && (() => {
        const iWin =
          (gameOver.result === "white_wins" && myColor === "white") ||
          (gameOver.result === "black_wins" && myColor === "black");
        const isDraw = gameOver.result === "draw";
        const outcome: "win" | "loss" | "draw" = isDraw ? "draw" : iWin ? "win" : "loss";
        // Use stored eloResult from useEffect (see below)
        const onlineResult: ResultData = {
          outcome,
          reason: gameOver.reason as ResultData["reason"],
          playerFaction: myColor === "white" ? "АВРОРА" : "НОВА",
          opponentFaction: myColor === "white" ? "НОВА" : "АВРОРА",
          opponentName: opponentName || undefined,
          moveCount: localGame?.moveNumber() ? localGame.moveNumber() * 2 : 0,
          eloDelta: onlineEloDelta ?? undefined,
          newRating: onlineNewRating ?? undefined,
        };
        return <ResultModal data={onlineResult} onNewGame={resetToLobby} />;
      })()}

      {phase === "over" && (
        <div className={s.actions}>
          <button className={s.actionBtn} style={{ "--ab": "#FFEE00" } as React.CSSProperties} onClick={resetToLobby}>
            НОВАЯ ИГРА
          </button>
        </div>
      )}

      {/* Promotion picker */}
      {pendingPromotion && (
        <div className={s.promotionOverlay}>
          <div className={s.promotionBox}>
            <p className={s.promotionTitle}>ВЫБЕРИ ФИГУРУ</p>
            <div className={s.promotionOptions}>
              {(["q","r","b","n"] as const).map(sym => {
                const typeMap = { q: "queen", r: "rook", b: "bishop", n: "knight" } as const;
                return (
                  <button key={sym} className={s.promotionBtn} onClick={() => handlePromotion(sym)}>
                    <ChessPiece type={typeMap[sym]} color={myColor} size={52} glowIntensity="medium" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
