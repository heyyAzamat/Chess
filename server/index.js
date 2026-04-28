const express  = require("express");
const http     = require("http");
const { Server } = require("socket.io");
const { Chess }  = require("chess.js");

const app    = express();
const server = http.createServer(app);
const io     = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

app.get("/health", (_, res) => res.json({ ok: true }));

// ── Room storage ─────────────────────────────────────────────────────────────
// { code: { game, players: { white, black }, status } }
const rooms = new Map();

const WORDS = ["NOVA", "AURORA", "EDEN", "ZERO", "KIRA", "AELA", "ZED", "FLASH", "DART"];

function genCode() {
  let code;
  do {
    const w = WORDS[Math.floor(Math.random() * WORDS.length)];
    const n = Math.floor(Math.random() * 9000) + 1000;
    code = `${w}-${n}`;
  } while (rooms.has(code));
  return code;
}

function broadcastState(code) {
  const room = rooms.get(code);
  if (!room) return;
  io.to(code).emit("state", {
    fen:    room.game.fen(),
    turn:   room.game.turn(),
    over:   room.game.isGameOver(),
    check:  room.game.isCheck(),
    mate:   room.game.isCheckmate(),
    stale:  room.game.isStalemate(),
    draw:   room.game.isDraw(),
  });
}

// ── Socket events ─────────────────────────────────────────────────────────────
io.on("connection", (socket) => {
  console.log("+ connected:", socket.id);

  // ── Create room ──────────────────────────────────────────────────────────
  socket.on("create_room", ({ username }) => {
    const code = genCode();
    rooms.set(code, {
      game: new Chess(),
      players: { white: { id: socket.id, username }, black: null },
      status: "waiting",
    });
    socket.join(code);
    socket.data = { code, color: "white", username };
    socket.emit("room_created", { code, color: "white" });
    console.log(`Room ${code} created by ${username}`);
  });

  // ── Join room ────────────────────────────────────────────────────────────
  socket.on("join_room", ({ code, username }) => {
    const room = rooms.get(code);
    if (!room) { socket.emit("room_error", "Комната не найдена"); return; }
    if (room.status !== "waiting") { socket.emit("room_error", "Комната занята"); return; }
    if (room.players.white.id === socket.id) { socket.emit("room_error", "Нельзя играть с собой"); return; }

    room.players.black = { id: socket.id, username };
    room.status = "playing";
    socket.join(code);
    socket.data = { code, color: "black", username };

    socket.emit("room_joined", {
      code,
      color: "black",
      opponentName: room.players.white.username,
    });
    socket.to(code).emit("opponent_joined", { opponentName: username });
    broadcastState(code);
    console.log(`${username} joined room ${code}`);
  });

  // ── Make move ────────────────────────────────────────────────────────────
  socket.on("make_move", ({ from, to, promotion }) => {
    const { code, color } = socket.data ?? {};
    const room = rooms.get(code);
    if (!room || room.status !== "playing") return;

    const expectedColor = room.game.turn() === "w" ? "white" : "black";
    if (color !== expectedColor) return;

    try {
      const move = room.game.move({ from, to, promotion: promotion ?? "q" });
      if (!move) return;
      broadcastState(code);

      if (room.game.isGameOver()) {
        let result = "draw", reason = "draw";
        if (room.game.isCheckmate()) {
          result = room.game.turn() === "w" ? "black_wins" : "white_wins";
          reason = "checkmate";
        } else if (room.game.isStalemate()) {
          reason = "stalemate";
        }
        io.to(code).emit("game_over", { result, reason });
        room.status = "over";
        console.log(`Room ${code} over: ${result} by ${reason}`);
      }
    } catch (_) {}
  });

  // ── Resign ───────────────────────────────────────────────────────────────
  socket.on("resign", () => {
    const { code, color } = socket.data ?? {};
    const room = rooms.get(code);
    if (!room) return;
    const result = color === "white" ? "black_wins" : "white_wins";
    io.to(code).emit("game_over", { result, reason: "resign" });
    room.status = "over";
    rooms.delete(code);
  });

  // ── Offer / accept draw ──────────────────────────────────────────────────
  socket.on("offer_draw", () => {
    const { code } = socket.data ?? {};
    socket.to(code).emit("draw_offered");
  });

  socket.on("accept_draw", () => {
    const { code } = socket.data ?? {};
    const room = rooms.get(code);
    if (!room) return;
    io.to(code).emit("game_over", { result: "draw", reason: "agreement" });
    room.status = "over";
    rooms.delete(code);
  });

  socket.on("decline_draw", () => {
    const { code } = socket.data ?? {};
    socket.to(code).emit("draw_declined");
  });

  // ── Disconnect ───────────────────────────────────────────────────────────
  socket.on("disconnect", () => {
    const { code } = socket.data ?? {};
    if (code && rooms.has(code)) {
      const room = rooms.get(code);
      if (room.status === "playing") {
        socket.to(code).emit("opponent_disconnected");
      }
      if (room.status !== "over") rooms.delete(code);
    }
    console.log("- disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Chess server → http://localhost:${PORT}`));
