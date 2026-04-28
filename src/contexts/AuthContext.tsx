import { createContext, useContext, useState, useCallback, useRef, useEffect, type ReactNode } from "react";

export interface User {
  id: string;
  username: string;
  faction: "aurora" | "nova";
  rating: number;
  wins: number;
  losses: number;
  draws: number;
  gamesPlayed: number;
  avatar: string;
}

export interface EloResult {
  newRating: number;
  delta: number;
}

interface AuthCtx {
  user: User | null;
  login:       (username: string, password: string) => Promise<string | null>;
  register:    (username: string, password: string, faction: "aurora" | "nova") => Promise<string | null>;
  logout:      () => void;
  updateStats: (result: "win" | "loss" | "draw", opponentRating: number) => EloResult;
}

const AuthContext = createContext<AuthCtx | null>(null);

export const STORAGE_KEY = "chess_users";
const SESSION_KEY = "chess_session";

export function loadUsers(): Record<string, { password: string; user: User }> {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}"); }
  catch { return {}; }
}

function saveUsers(users: Record<string, { password: string; user: User }>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

function loadSession(): User | null {
  try {
    const u = JSON.parse(localStorage.getItem(SESSION_KEY) ?? "null");
    if (u && u.gamesPlayed === undefined) {
      u.gamesPlayed = (u.wins ?? 0) + (u.losses ?? 0) + (u.draws ?? 0);
    }
    return u;
  } catch { return null; }
}

// ── Real ELO ─────────────────────────────────────────────────────────────────
function calcElo(playerRating: number, opponentRating: number, result: "win" | "loss" | "draw", gamesPlayed: number): EloResult {
  const K = gamesPlayed < 20 ? 40 : gamesPlayed < 60 ? 28 : 20;
  const expected = 1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400));
  const score    = result === "win" ? 1 : result === "draw" ? 0.5 : 0;
  const delta    = Math.round(K * (score - expected));
  return { newRating: Math.max(800, playerRating + delta), delta };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(loadSession);

  // Always-current ref — решает проблему с useCallback и устаревшим closure
  const userRef = useRef<User | null>(user);
  useEffect(() => { userRef.current = user; }, [user]);

  const login = useCallback(async (username: string, password: string): Promise<string | null> => {
    const users = loadUsers();
    const entry = users[username.toLowerCase()];
    if (!entry) return "Пользователь не найден";
    if (entry.password !== password) return "Неверный пароль";
    if (entry.user.gamesPlayed === undefined) {
      entry.user.gamesPlayed = entry.user.wins + entry.user.losses + entry.user.draws;
    }
    setUser(entry.user);
    localStorage.setItem(SESSION_KEY, JSON.stringify(entry.user));
    return null;
  }, []);

  const register = useCallback(async (
    username: string, password: string, faction: "aurora" | "nova",
  ): Promise<string | null> => {
    if (username.trim().length < 3) return "Минимум 3 символа";
    if (password.length < 4) return "Минимум 4 символа";
    const users = loadUsers();
    const key   = username.toLowerCase();
    if (users[key]) return "Имя уже занято";
    const newUser: User = {
      id: crypto.randomUUID(),
      username: username.trim(),
      faction,
      rating: 1200, wins: 0, losses: 0, draws: 0, gamesPlayed: 0,
      avatar: username.slice(0, 2).toUpperCase(),
    };
    users[key] = { password, user: newUser };
    saveUsers(users);
    setUser(newUser);
    localStorage.setItem(SESSION_KEY, JSON.stringify(newUser));
    return null;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
  }, []);

  // Синхронно вычисляет ELO из userRef, сохраняет в localStorage и state
  const updateStats = useCallback((result: "win" | "loss" | "draw", opponentRating: number): EloResult => {
    const current = userRef.current;
    if (!current) return { newRating: 1200, delta: 0 };

    const gp      = current.gamesPlayed ?? 0;
    const elo     = calcElo(current.rating, opponentRating, result, gp);

    const updated: User = {
      ...current,
      rating:      elo.newRating,
      wins:        current.wins   + (result === "win"  ? 1 : 0),
      losses:      current.losses + (result === "loss" ? 1 : 0),
      draws:       current.draws  + (result === "draw" ? 1 : 0),
      gamesPlayed: gp + 1,
    };

    // Сохраняем синхронно
    localStorage.setItem(SESSION_KEY, JSON.stringify(updated));
    const users = loadUsers();
    const key   = current.username.toLowerCase();
    if (users[key]) { users[key].user = updated; saveUsers(users); }

    // Обновляем state (и ref через useEffect)
    setUser(updated);

    return elo;
  }, []); // deps пустые — используем ref

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateStats }}>
      {children}
    </AuthContext.Provider>
  );
}

// Обновить рейтинг любого пользователя по username (не меняет сессию)
export function updateOtherUserStats(
  username: string,
  result: "win" | "loss" | "draw",
  opponentRating: number,
): EloResult | null {
  const users = loadUsers();
  const key   = username.toLowerCase();
  const entry = users[key];
  if (!entry) return null;

  const u  = entry.user;
  const gp = u.gamesPlayed ?? (u.wins + u.losses + u.draws);
  const elo = calcElo(u.rating, opponentRating, result, gp);

  users[key].user = {
    ...u,
    rating:      elo.newRating,
    wins:        u.wins   + (result === "win"  ? 1 : 0),
    losses:      u.losses + (result === "loss" ? 1 : 0),
    draws:       u.draws  + (result === "draw" ? 1 : 0),
    gamesPlayed: gp + 1,
  };
  saveUsers(users);
  return elo;
}

// Найти пользователя по username (без пароля)
export function findUser(username: string): User | null {
  const users = loadUsers();
  return users[username.toLowerCase()]?.user ?? null;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
