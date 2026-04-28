import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCurrency, COIN, BET_MULTIPLIERS, MAX_BET_FREE } from "../contexts/CurrencyContext";
import { CoinDisplay } from "../components/CoinDisplay/CoinDisplay";
import s from "./ModeSelectPage.module.css";

type Difficulty = "easy" | "medium" | "hard";

const DIFFICULTIES: { val: Difficulty; label: string; sub: string; color: string }[] = [
  { val: "easy",   label: "ЛЕГКО",   sub: "Начинающий", color: "#4caf50" },
  { val: "medium", label: "СРЕДНЕ",  sub: "Любитель",   color: "#FFEE00" },
  { val: "hard",   label: "СЛОЖНО",  sub: "Опытный",    color: "#FF2D78" },
];

export function ModeSelectPage() {
  const navigate = useNavigate();
  const { coins, isPremium, maxBet } = useCurrency();
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [stake, setStake] = useState(0);

  const DiffPicker = () => (
    <div className={s.diffRow}>
      {DIFFICULTIES.map(d => (
        <button
          key={d.val}
          className={`${s.diffBtn} ${difficulty === d.val ? s.diffBtnActive : ""}`}
          style={{ "--dc": d.color } as React.CSSProperties}
          onClick={() => setDifficulty(d.val)}
        >
          <span className={s.diffLabel}>{d.label}</span>
          <span className={s.diffSub}>{d.sub}</span>
        </button>
      ))}
    </div>
  );

  return (
    <div className={s.page}>
      <div className={s.bg} />

      <header className={s.header}>
        <button className={s.backBtn} onClick={() => navigate("/")}>← НАЗАД</button>
        <h1 className={s.title}>ВЫБЕРИ РЕЖИМ</h1>
        <CoinDisplay size="sm" />
      </header>

      <main className={s.main}>

        {/* ── Два верхних — ИГРА и СЮЖЕТ ── */}
        <div className={s.topRow}>

          {/* ОБЫЧНАЯ ИГРА */}
          <div className={s.modeCard} style={{ "--mc": "#FFEE00", "--mg": "#FFEE0018" } as React.CSSProperties}>
            <div className={s.modeHeader}>
              <span className={s.modeIcon}>♟</span>
              <div>
                <h2 className={s.modeName}>ИГРА</h2>
                <p className={s.modeTagline}>Чистые шахматы</p>
              </div>
            </div>
            <p className={s.modeDesc}>
              Классическая партия против бота. Никакого нарратива — только доска,
              фигуры и твоя стратегия.
            </p>
            <DiffPicker />
            {/* Stake */}
            <div className={s.stakeRow}>
              <span className={s.stakeLabel}>{COIN} СТАВКА</span>
              <input
                type="number"
                className={s.stakeInput}
                min={0} max={Math.min(maxBet, coins)} step={10}
                value={stake}
                onChange={e => setStake(Math.min(Math.min(maxBet, coins), Math.max(0, Number(e.target.value))))}
              />
              <span className={s.stakeMulti}>
                ×{BET_MULTIPLIERS[difficulty]} = {COIN}{Math.round(stake * BET_MULTIPLIERS[difficulty])}
              </span>
            </div>
            {!isPremium && stake > MAX_BET_FREE && (
              <p className={s.stakeNote}>Лимит {MAX_BET_FREE} {COIN} без Premium</p>
            )}

            <button
              className={s.startBtn}
              style={{ "--sc": "#FFEE00" } as React.CSSProperties}
              onClick={() => navigate(`/game?mode=bot&difficulty=${difficulty}&stake=${stake}`)}
            >
              ИГРАТЬ →
            </button>
          </div>

          {/* СЮЖЕТНЫЙ РЕЖИМ */}
          <div className={s.modeCard} style={{ "--mc": "#C9A84C", "--mg": "#C9A84C18" } as React.CSSProperties}>
            <div className={s.modeHeader}>
              <span className={s.modeIcon}>◈</span>
              <div>
                <h2 className={s.modeName}>СЮЖЕТ</h2>
                <p className={s.modeTagline}>Эдем-Зеро · Протокол Войны</p>
              </div>
            </div>
            <p className={s.modeDesc}>
              Та же партия — но каждый ход раскрывает историю. Комикс-панели,
              диалоги персонажей и нарратив разворачиваются прямо во время игры.
            </p>
            <div className={s.featureList}>
              <span className={s.feature}>◈ Диалоги персонажей</span>
              <span className={s.feature}>◈ Комикс-сцены в ключевые моменты</span>
              <span className={s.feature}>◈ Нарративный финал</span>
            </div>
            <DiffPicker />
            <div className={s.stakeRow}>
              <span className={s.stakeLabel}>{COIN} СТАВКА</span>
              <input
                type="number"
                className={s.stakeInput}
                min={0} max={Math.min(maxBet, coins)} step={10}
                value={stake}
                onChange={e => setStake(Math.min(Math.min(maxBet, coins), Math.max(0, Number(e.target.value))))}
              />
              <span className={s.stakeMulti}>
                ×{BET_MULTIPLIERS[difficulty]} = {COIN}{Math.round(stake * BET_MULTIPLIERS[difficulty])}
              </span>
            </div>

            <button
              className={s.startBtn}
              style={{ "--sc": "#C9A84C" } as React.CSSProperties}
              onClick={() => navigate(`/game?mode=story&difficulty=${difficulty}&stake=${stake}`)}
            >
              НАЧАТЬ ИСТОРИЮ →
            </button>
          </div>

        </div>

        {/* ── Нижняя строка — ОБУЧЕНИЕ и МУЛЬТИПЛЕЕР ── */}
        <div className={s.bottomRow}>

          {/* ОБУЧЕНИЕ */}
          <div className={s.modeCardSmall} style={{ "--mc": "#4A90D9", "--mg": "#4A90D918" } as React.CSSProperties}>
            <div className={s.modeHeader}>
              <span className={s.modeIconSm}>◌</span>
              <div>
                <h2 className={s.modeNameSm}>ОБУЧЕНИЕ</h2>
                <p className={s.modeTagline}>С подсказками</p>
              </div>
            </div>
            <div className={s.featureList}>
              <span className={s.feature}>✓ Подсветка всех ходов</span>
              <span className={s.feature}>✓ Кнопка ПОДСКАЗКА</span>
            </div>
            <button
              className={s.startBtn}
              style={{ "--sc": "#4A90D9" } as React.CSSProperties}
              onClick={() => navigate("/game?mode=training")}
            >
              УЧИТЬСЯ →
            </button>
          </div>

          {/* МУЛЬТИПЛЕЕР */}
          <div className={s.modeCardSmall} style={{ "--mc": "#FF2D78", "--mg": "#FF2D7818" } as React.CSSProperties}>
            <div className={s.modeHeader}>
              <span className={s.modeIconSm}>⚔</span>
              <div>
                <h2 className={s.modeNameSm}>МУЛЬТИ</h2>
                <p className={s.modeTagline}>Двое игроков</p>
              </div>
            </div>
            <div className={s.multiOptions}>
              <button
                className={s.startBtn}
                style={{ "--sc": "#FF2D78" } as React.CSSProperties}
                onClick={() => navigate("/game?mode=multiplayer")}
              >
                ЛОКАЛЬНО →
              </button>
              <div className={s.onlineRow}>
                <button
                  className={s.startBtn}
                  style={{ "--sc": "#FF6B1A" } as React.CSSProperties}
                  onClick={() => navigate("/online")}
                >
                  ОНЛАЙН →
                </button>
                <span className={s.onlineNote}>★ Очки ЭЛО за победу</span>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
