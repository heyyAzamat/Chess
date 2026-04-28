import { useState, useCallback, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Board, type GameMode, type BoardEvent } from "../components/board/Board";
import { ComicViewer } from "../components/comic/ComicViewer";
import { StoryPanel } from "../components/StoryPanel/StoryPanel";
import { ResultModal, type ResultData, type PlayerElo } from "../components/ResultModal/ResultModal";
import { MultiplayerSetup, type MultiplayerPlayers } from "../components/MultiplayerSetup/MultiplayerSetup";
import { CoachPanel } from "../components/Coach/CoachPanel";
import { useComicTrigger } from "../components/comic/useComicTrigger";
import { useStoryScript } from "../hooks/useStoryScript";
import { useSound } from "../hooks/useSound";
import { useAuth, updateOtherUserStats } from "../contexts/AuthContext";
import { useCurrency, GAME_REWARDS, BET_MULTIPLIERS, COIN } from "../contexts/CurrencyContext";
import type { CoachMoveRecord } from "../chess/coach";
import type { StoryTrigger } from "../narrative/storyScript";
import s from "./SecondaryPage.module.css";

// "story" is a UI-level mode — board always uses "bot" logic
type PageMode = GameMode | "story";

const MODE_LABELS: Record<PageMode, string> = {
  bot:         "ИГРА",
  story:       "СЮЖЕТ",
  training:    "ОБУЧЕНИЕ",
  multiplayer: "МУЛЬТИПЛЕЕР",
};

const BOARD_TO_STORY: Partial<Record<BoardEvent, StoryTrigger>> = {
  first_capture_player:    "first_capture_player",
  first_capture_opponent:  "first_capture_opponent",
  castling:                "castling",
  check_given:             "check_given",
  check_received:          "check_received",
  pawn_promotion_player:   "pawn_promotion_player",
  pawn_promotion_opponent: "pawn_promotion_opponent",
  knight_strike:           "knight_strike",
};

const MOVE_TRIGGERS: Record<number, StoryTrigger> = {
  5: "move_5", 10: "move_10", 20: "move_20", 30: "move_30",
};

export function GamePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, updateStats } = useAuth();
  const { addCoins, spendCoins, isPremium } = useCurrency();

  const rawMode = searchParams.get("mode") ?? "bot";
  const pageMode: PageMode = (["bot","story","training","multiplayer"] as PageMode[]).includes(rawMode as PageMode)
    ? rawMode as PageMode : "bot";
  const difficulty = searchParams.get("difficulty") ?? "medium";
  const stake      = Math.max(0, parseInt(searchParams.get("stake") ?? "0", 10) || 0);

  const BOT_RATING: Record<string, number> = { easy: 900, medium: 1350, hard: 1750 };
  const botRating = BOT_RATING[difficulty] ?? 1350;

  // Board always gets "bot" for story/bot modes
  const boardMode: GameMode =
    pageMode === "story" ? "bot" :
    pageMode === "bot"   ? "bot" :
    pageMode as GameMode;

  const isStory      = pageMode === "story";
  const isMultiplayer = pageMode === "multiplayer";
  const trackStats   = pageMode === "bot" || pageMode === "story";

  const [gameKey, setGameKey]         = useState(0);
  const [resultData, setResultData]   = useState<ResultData | null>(null);
  const [mpPlayers, setMpPlayers]     = useState<MultiplayerPlayers | null>(null);
  const [showSetup, setShowSetup]     = useState(isMultiplayer);
  const [moveHistory, setMoveHistory] = useState<CoachMoveRecord[]>([]);
  const [showCoach, setShowCoach]     = useState(false); // show setup first for MP

  const { activeScene, closeScene, onGameStart, onMove, onCapture, onCheckmate } = useComicTrigger();
  const story = useStoryScript();
  const { play } = useSound();

  const firedMoves      = useRef(new Set<number>());
  const queenFired      = useRef(false);
  const firedMilestones = useRef(new Set<number>());

  const handleGameEvent = useCallback((event: BoardEvent, moveNum: number) => {
    if (!isStory) return; // story triggers only in story mode

    const storyTrigger = BOARD_TO_STORY[event];
    if (storyTrigger) story.trigger(storyTrigger);

    for (const [threshold, trigger] of Object.entries(MOVE_TRIGGERS)) {
      const n = Number(threshold);
      if (moveNum >= n && !firedMilestones.current.has(n)) {
        firedMilestones.current.add(n);
        story.trigger(trigger);
        if (n === 10 && !firedMoves.current.has(10)) {
          firedMoves.current.add(10);
          onMove(10);
        }
      }
    }
  }, [isStory, story, onMove]);

  const handleQueenCaptured = useCallback(() => {
    if (!isStory) return;
    if (!queenFired.current) {
      queenFired.current = true;
      onCapture("queen");
    }
  }, [isStory, onCapture]);

  const handleGameOver = useCallback(
    (status: "checkmate" | "stalemate" | "draw", moveCount: number, winner: "player" | "opponent" | "draw", history: CoachMoveRecord[]) => {
      setMoveHistory(history);
      if (isStory) {
        if (status === "checkmate") {
          onCheckmate();
          story.trigger(winner === "player" ? "checkmate_win" : "checkmate_loss");
        }
        if (status === "stalemate") story.trigger("stalemate");
      }

      const isDraw = winner === "draw";
      setTimeout(() => play(isDraw ? "draw" : winner === "player" ? "victory" : "defeat"), 500);

      const reason: ResultData["reason"] =
        status === "checkmate" ? "checkmate" : status === "stalemate" ? "stalemate" : "draw";

      // ── Монеты ───────────────────────────────────────────────────────────
      if (trackStats && !isMultiplayer) {
        const mult = isPremium ? 1.5 : 1;

        // Lock stake at game start (spend now, earn back on win)
        if (stake > 0) {
          const betMult = (BET_MULTIPLIERS as Record<string, number>)[difficulty] ?? 2;
          if (isDraw) {
            // Refund stake
            addCoins(stake, "bet_refund", `Ставка возвращена (ничья) ${COIN}${stake}`);
          } else if (winner === "player") {
            const winAmount = Math.round(stake * betMult);
            addCoins(winAmount, "bet_win", `Выигрыш ставки ×${betMult} = ${COIN}${winAmount}`);
          }
          // loss: stake stays spent (was deducted on game start)
        }

        // Base reward
        const baseKey = isDraw ? "draw" : winner === "player" ? `win_${difficulty}` : "loss";
        const base = (GAME_REWARDS as Record<string, number>)[baseKey] ?? GAME_REWARDS.participation;
        const earned = Math.round(base * mult);
        addCoins(earned, isDraw ? "game_draw" : winner === "player" ? "game_win" : "game_loss",
          `${isDraw ? "Ничья" : winner === "player" ? "Победа" : "Участие"} (${difficulty}) +${COIN}${earned}`);
      }

      // ── Мультиплеер: обновляем обоих ────────────────────────────────────
      if (isMultiplayer && mpPlayers) {
        const { p1, p2, p2name } = mpPlayers;
        // winner = "player" → белые (p1), "opponent" → чёрные (p2)
        const p1result = isDraw ? "draw" : winner === "player" ? "win" : "loss";
        const p2result = isDraw ? "draw" : winner === "opponent" ? "win" : "loss";

        const p2rating = p2?.rating ?? 1200;
        const p1elo = updateStats(p1result, p2rating);
        const p2elo = p2 ? updateOtherUserStats(p2.username, p2result, p1.rating) : null;

        const multiElo: [PlayerElo, PlayerElo] = [
          {
            username: p1.username,
            faction: p1.faction === "aurora" ? "АВРОРА" : "НОВА",
            eloDelta: p1elo.delta,
            newRating: p1elo.newRating,
            isWinner: winner === "player",
          },
          {
            username: p2name,
            faction: p2?.faction === "aurora" ? "АВРОРА" : "НОВА",
            eloDelta: p2elo?.delta ?? 0,
            newRating: p2elo?.newRating ?? (p2?.rating ?? 1200),
            isWinner: winner === "opponent",
          },
        ];

        setResultData({
          outcome: isDraw ? "draw" : winner === "player" ? "win" : "loss",
          reason,
          playerFaction: p1.faction === "aurora" ? "АВРОРА" : "НОВА",
          opponentFaction: p2?.faction === "aurora" ? "АВРОРА" : "НОВА",
          moveCount,
          multiElo,
        });
        return;
      }

      // ── Бот / Сюжет ──────────────────────────────────────────────────────
      const outcome: ResultData["outcome"] =
        winner === "player" ? "win" : winner === "opponent" ? "loss" : "draw";

      let eloDelta: number | undefined;
      let newRating: number | undefined;

      if (trackStats) {
        const eloResult = updateStats(outcome, botRating);
        eloDelta  = eloResult.delta;
        newRating = eloResult.newRating;
      }

      setResultData({
        outcome, reason,
        playerFaction: "АВРОРА",
        opponentFaction: "НОВА",
        moveCount, eloDelta, newRating,
      });
    },
    [isStory, isMultiplayer, mpPlayers, onCheckmate, story, play, trackStats, updateStats, botRating],
  );

  function startNewGame() {
    firedMoves.current.clear();
    firedMilestones.current.clear();
    queenFired.current = false;
    story.reset();
    setResultData(null);
    if (isMultiplayer) { setShowSetup(true); return; } // go back to setup
    setGameKey(k => k + 1);
    if (!isMultiplayer) {
      setTimeout(() => {
        play("gameStart");
        if (isStory) { onGameStart(); story.trigger("game_start"); }
      }, 400);
    }
  }

  const didStart = useRef(false);
  if (!didStart.current) {
    didStart.current = true;
    // Deduct stake at game start
    if (stake > 0 && trackStats) {
      spendCoins(stake, "bet_lose", `Ставка заблокирована ${COIN}${stake}`);
    }
    if (!isMultiplayer) {
      setTimeout(() => {
        play("gameStart");
        if (isStory) { onGameStart(); story.trigger("game_start"); }
      }, 500);
    }
  }

  // Multiplayer setup screen
  if (isMultiplayer && showSetup && user) {
    return (
      <div className={s.page}>
        <header className={s.header}>
          <button className={s.backBtn} onClick={() => navigate("/play")}>← РЕЖИМЫ</button>
          <h1 className={s.pageTitle} style={{ fontSize: 22 }}>МУЛЬТИПЛЕЕР</h1>
          <div />
        </header>
        <MultiplayerSetup
          p1={user}
          onStart={(players) => {
            setMpPlayers(players);
            setShowSetup(false);
            setGameKey(k => k + 1);
          }}
          onBack={() => navigate("/play")}
        />
      </div>
    );
  }

  return (
    <div className={s.page}>
      <header className={s.header}>
        <button className={s.backBtn} onClick={() => navigate("/play")}>← РЕЖИМЫ</button>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
          <h1 className={s.pageTitle} style={{ fontSize: 22 }}>
            {MODE_LABELS[pageMode]}
          </h1>
          {isStory && (
            <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 11, color: "#555", letterSpacing: "0.1em" }}>
              ЭДЕМ-ЗЕРО · ПРОТОКОЛ ВОЙНЫ
            </span>
          )}
        </div>
        <button className={s.backBtn} onClick={startNewGame}>↺ НОВАЯ</button>
      </header>

      <main style={{ flex: 1, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "20px 16px 100px" }}>
        <Board
          key={gameKey}
          mode={boardMode}
          difficulty={difficulty}
          playerColor="white"
          onGameEvent={handleGameEvent}
          onQueenCaptured={handleQueenCaptured}
          onCheckmate={() => {}}
          onGameOver={handleGameOver}
        />
      </main>

      {/* Narrative — only in story mode */}
      {isStory && story.current && !activeScene && !resultData && (
        <StoryPanel
          key={story.current.id}
          moment={story.current}
          duration={5200}
          onDone={story.dismiss}
          onReady={(d) => { story.onPanelReady(d); play("storyPanel"); }}
        />
      )}

      {isStory && activeScene && (
        <ComicViewer scene={activeScene} onClose={closeScene} />
      )}

      {resultData && (
        <ResultModal
          data={resultData}
          onNewGame={startNewGame}
          onCoach={!isMultiplayer ? () => setShowCoach(true) : undefined}
        />
      )}

      {showCoach && moveHistory.length > 0 && (
        <CoachPanel
          records={moveHistory}
          playerColor="w"
          onClose={() => setShowCoach(false)}
        />
      )}
    </div>
  );
}
