import { useState, useEffect, useCallback, useRef } from "react";
import { Chess, type Square } from "chess.js";
import { getSocket, disconnectSocket } from "../services/socket";
import type { ChessColor } from "../narrative/narrative.types";

export type OnlinePhase = "lobby" | "waiting" | "playing" | "over";

interface GameState {
  fen: string;
  turn: "w" | "b";
  over: boolean;
  check: boolean;
  mate: boolean;
  stale: boolean;
  draw: boolean;
}

interface GameOver {
  result: "white_wins" | "black_wins" | "draw";
  reason: "checkmate" | "resign" | "stalemate" | "agreement" | "draw";
}

export function useOnlineGame(username: string) {
  const [phase, setPhase]               = useState<OnlinePhase>("lobby");
  const [roomCode, setRoomCode]         = useState("");
  const [myColor, setMyColor]           = useState<ChessColor>("white");
  const [opponentName, setOpponentName] = useState("");
  const [gameState, setGameState]       = useState<GameState | null>(null);
  const [gameOver, setGameOver]         = useState<GameOver | null>(null);
  const [error, setError]               = useState<string | null>(null);
  const [connected, setConnected]       = useState(false);
  const [drawOffered, setDrawOffered]   = useState(false);

  const socket = useRef(getSocket());

  useEffect(() => {
    const s = socket.current;

    s.connect();

    s.on("connect",    () => { setConnected(true);  setError(null); });
    s.on("disconnect", () => { setConnected(false); });

    s.on("room_created", ({ code, color }: { code: string; color: ChessColor }) => {
      setRoomCode(code);
      setMyColor(color);
      setPhase("waiting");
    });

    s.on("room_joined", ({ code, color, opponentName: opp }: { code: string; color: ChessColor; opponentName: string }) => {
      setRoomCode(code);
      setMyColor(color);
      setOpponentName(opp);
      setPhase("playing");
    });

    s.on("opponent_joined", ({ opponentName: opp }: { opponentName: string }) => {
      setOpponentName(opp);
      setPhase("playing");
    });

    s.on("state", (gs: GameState) => {
      setGameState(gs);
    });

    s.on("game_over", (go: GameOver) => {
      setGameOver(go);
      setPhase("over");
    });

    s.on("opponent_disconnected", () => {
      setError("Соперник отключился");
      setPhase("over");
      setGameOver({ result: myColor === "white" ? "white_wins" : "black_wins", reason: "resign" });
    });

    s.on("room_error", (msg: string) => {
      setError(msg);
    });

    s.on("draw_offered", () => setDrawOffered(true));
    s.on("draw_declined", () => setError("Соперник отклонил ничью"));

    return () => {
      s.off("connect"); s.off("disconnect");
      s.off("room_created"); s.off("room_joined"); s.off("opponent_joined");
      s.off("state"); s.off("game_over"); s.off("opponent_disconnected");
      s.off("room_error"); s.off("draw_offered"); s.off("draw_declined");
    };
  }, [myColor]);

  // Cleanup on unmount
  useEffect(() => () => { disconnectSocket(); }, []);

  const createRoom = useCallback(() => {
    setError(null);
    socket.current.emit("create_room", { username });
  }, [username]);

  const joinRoom = useCallback((code: string) => {
    setError(null);
    socket.current.emit("join_room", { code: code.trim().toUpperCase(), username });
  }, [username]);

  const sendMove = useCallback((from: Square, to: Square, promotion?: string) => {
    socket.current.emit("make_move", { from, to, promotion });
  }, []);

  const resign = useCallback(() => {
    socket.current.emit("resign");
  }, []);

  const offerDraw = useCallback(() => {
    socket.current.emit("offer_draw");
  }, []);

  const acceptDraw = useCallback(() => {
    setDrawOffered(false);
    socket.current.emit("accept_draw");
  }, []);

  const declineDraw = useCallback(() => {
    setDrawOffered(false);
    socket.current.emit("decline_draw");
  }, []);

  const resetToLobby = useCallback(() => {
    setPhase("lobby");
    setRoomCode("");
    setOpponentName("");
    setGameState(null);
    setGameOver(null);
    setError(null);
    setDrawOffered(false);
    disconnectSocket();
    socket.current = getSocket();
    socket.current.connect();
  }, []);

  // Local chess instance to compute valid moves for UI
  const localGame = gameState ? new Chess(gameState.fen) : null;
  const isMyTurn = gameState?.turn === (myColor === "white" ? "w" : "b");

  return {
    phase, roomCode, myColor, opponentName,
    gameState, gameOver, error, connected,
    drawOffered, isMyTurn, localGame,
    createRoom, joinRoom, sendMove,
    resign, offerDraw, acceptDraw, declineDraw,
    resetToLobby,
  };
}
