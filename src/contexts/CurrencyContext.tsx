import { createContext, useContext, useState, useCallback, useRef, useEffect, type ReactNode } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

export type TxType =
  | "game_win" | "game_loss" | "game_draw" | "game_participation"
  | "bet_win" | "bet_lose" | "bet_refund"
  | "premium_purchase" | "coins_purchase" | "daily_bonus" | "signup_bonus";

export interface Transaction {
  id: string;
  type: TxType;
  amount: number;       // + earn, - spend
  description: string;
  timestamp: string;
}

export interface PremiumStatus {
  active: boolean;
  plan: "monthly" | "quarterly" | null;
  expiresAt: string | null;
}

export interface CurrencyData {
  coins: number;
  premium: PremiumStatus;
  transactions: Transaction[];
  lastDailyBonus: string | null;
  lastGameDate: string | null;
}

interface CurrencyCtx {
  coins: number;
  premium: PremiumStatus;
  transactions: Transaction[];
  addCoins:    (amount: number, type: TxType, desc: string) => void;
  spendCoins:  (amount: number, type: TxType, desc: string) => boolean; // returns false if insufficient
  buyPremium:  (plan: "monthly" | "quarterly", payWithCoins: boolean) => boolean;
  claimDaily:  () => number; // returns amount earned (0 if already claimed)
  canAfford:   (amount: number) => boolean;
  isPremium:   boolean;
  maxBet:      number;
}

const CurrencyContext = createContext<CurrencyCtx | null>(null);

const STORAGE_KEY = "chess_currency";

// ── Constants ─────────────────────────────────────────────────────────────────

export const COIN = "⬡"; // visual symbol

export const PREMIUM_COST = { monthly: 299, quarterly: 699 } as const;
export const PREMIUM_DAYS = { monthly: 30, quarterly: 90 } as const;

export const GAME_REWARDS = {
  win_easy:   15,
  win_medium: 30,
  win_hard:   60,
  loss:        5,
  draw:       10,
  participation: 3,
} as const;

export const DAILY_BONUS = 25;
export const SIGNUP_BONUS = 150;

export const BET_MULTIPLIERS = { easy: 1.5, medium: 2.0, hard: 2.5 } as const;
export const MAX_BET_FREE    = 200;
export const MAX_BET_PREMIUM = 1000;

// ── Storage ───────────────────────────────────────────────────────────────────

function loadData(): CurrencyData {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null") ?? {
      coins: SIGNUP_BONUS,
      premium: { active: false, plan: null, expiresAt: null },
      transactions: [{ id: "signup", type: "signup_bonus", amount: SIGNUP_BONUS, description: "Бонус за регистрацию", timestamp: new Date().toISOString() }],
      lastDailyBonus: null,
      lastGameDate: null,
    };
  } catch { return { coins: SIGNUP_BONUS, premium: { active: false, plan: null, expiresAt: null }, transactions: [], lastDailyBonus: null, lastGameDate: null }; }
}

function saveData(data: CurrencyData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function isPremiumActive(p: PremiumStatus): boolean {
  if (!p.active || !p.expiresAt) return false;
  return new Date(p.expiresAt) > new Date();
}

// ── Provider ──────────────────────────────────────────────────────────────────

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<CurrencyData>(loadData);
  const dataRef = useRef(data);
  useEffect(() => { dataRef.current = data; }, [data]);

  function mutate(updater: (d: CurrencyData) => CurrencyData) {
    setData(prev => {
      const next = updater({ ...prev, transactions: [...prev.transactions] });
      saveData(next);
      return next;
    });
  }

  const addCoins = useCallback((amount: number, type: TxType, desc: string) => {
    mutate(d => ({
      ...d,
      coins: d.coins + amount,
      transactions: [{ id: crypto.randomUUID(), type, amount, description: desc, timestamp: new Date().toISOString() }, ...d.transactions].slice(0, 50),
    }));
  }, []);

  const spendCoins = useCallback((amount: number, type: TxType, desc: string): boolean => {
    if (dataRef.current.coins < amount) return false;
    mutate(d => ({
      ...d,
      coins: d.coins - amount,
      transactions: [{ id: crypto.randomUUID(), type, amount: -amount, description: desc, timestamp: new Date().toISOString() }, ...d.transactions].slice(0, 50),
    }));
    return true;
  }, []);

  const buyPremium = useCallback((plan: "monthly" | "quarterly", payWithCoins: boolean): boolean => {
    const cost = PREMIUM_COST[plan];
    const days = PREMIUM_DAYS[plan];

    if (payWithCoins && dataRef.current.coins < cost) return false;

    mutate(d => {
      const now = new Date();
      // Extend if already premium
      const base = d.premium.active && d.premium.expiresAt && new Date(d.premium.expiresAt) > now
        ? new Date(d.premium.expiresAt)
        : now;
      base.setDate(base.getDate() + days);

      const coins = payWithCoins ? d.coins - cost : d.coins;
      const tx: Transaction = {
        id: crypto.randomUUID(), type: "premium_purchase",
        amount: payWithCoins ? -cost : 0,
        description: `Premium ${plan} (${days} дней)`,
        timestamp: now.toISOString(),
      };

      return {
        ...d,
        coins,
        premium: { active: true, plan, expiresAt: base.toISOString() },
        transactions: [tx, ...d.transactions].slice(0, 50),
      };
    });
    return true;
  }, []);

  const claimDaily = useCallback((): number => {
    const today = new Date().toDateString();
    if (dataRef.current.lastDailyBonus === today) return 0;
    const bonus = isPremiumActive(dataRef.current.premium) ? Math.round(DAILY_BONUS * 1.5) : DAILY_BONUS;
    mutate(d => ({
      ...d,
      coins: d.coins + bonus,
      lastDailyBonus: today,
      transactions: [{ id: crypto.randomUUID(), type: "daily_bonus", amount: bonus, description: "Ежедневный бонус", timestamp: new Date().toISOString() }, ...d.transactions].slice(0, 50),
    }));
    return bonus;
  }, []);

  const canAfford   = useCallback((n: number) => dataRef.current.coins >= n, []);
  const isPremium   = isPremiumActive(data.premium);
  const maxBet      = isPremium ? MAX_BET_PREMIUM : MAX_BET_FREE;

  return (
    <CurrencyContext.Provider value={{ coins: data.coins, premium: data.premium, transactions: data.transactions, addCoins, spendCoins, buyPremium, claimDaily, canAfford, isPremium, maxBet }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be inside CurrencyProvider");
  return ctx;
}
