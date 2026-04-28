import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useCurrency, COIN,
  PREMIUM_COST, PREMIUM_DAYS,
  DAILY_BONUS,
} from "../contexts/CurrencyContext";
import s from "./ShopPage.module.css";

const COIN_PACKS = [
  { id: "starter", coins: 100,  label: "СТАРТЕР",   price: "Бесплатно", priceRub: null,   color: "#4caf50", popular: false },
  { id: "small",   coins: 500,  label: "БАЗОВЫЙ",   price: "99₽",       priceRub: 99,     color: "#4A90D9", popular: false },
  { id: "medium",  coins: 1500, label: "ПРОДВИНУТЫЙ",price: "249₽",     priceRub: 249,    color: "#FFEE00", popular: true  },
  { id: "big",     coins: 5000, label: "ЭЛИТНЫЙ",   price: "599₽",      priceRub: 599,    color: "#C9A84C", popular: false },
];

const PREMIUM_PLANS = [
  {
    id: "monthly",
    label: "МЕСЯЧНЫЙ",
    days: 30,
    coinCost: PREMIUM_COST.monthly,
    rubCost: 199,
    perks: ["★ Premium значок в рейтинге", "⬡ ×1.5 монет за партию", "⬡ +37 монет ежедневный бонус", "⚔ Ставки до 1000 монет", "🧠 AI Coach без ограничений"],
  },
  {
    id: "quarterly",
    label: "КВАРТАЛЬНЫЙ",
    days: 90,
    coinCost: PREMIUM_COST.quarterly,
    rubCost: 449,
    perks: ["Всё из Месячного", "⬡ Бонус 200 монет при активации", "22% выгода vs месячного"],
    highlight: true,
  },
] as const;

export function ShopPage() {
  const navigate = useNavigate();
  const { coins, isPremium, premium, addCoins, spendCoins, buyPremium, claimDaily, canAfford } = useCurrency();
  const [toast, setToast] = useState<string | null>(null);
  const [claimedToday, setClaimedToday] = useState(false);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  function handleFreePack() {
    addCoins(100, "coins_purchase", "Стартовый пак (бесплатно)");
    showToast(`+100 ${COIN} зачислено!`);
  }

  function handleBuyPack(pack: typeof COIN_PACKS[number]) {
    // In real app: payment gateway. Here: demo mode.
    addCoins(pack.coins, "coins_purchase", `Покупка: ${pack.label}`);
    showToast(`+${pack.coins} ${COIN} зачислено! (демо)`);
  }

  function handleDailyBonus() {
    const earned = claimDaily();
    if (earned > 0) {
      setClaimedToday(true);
      showToast(`+${earned} ${COIN} ежедневный бонус!`);
    } else {
      showToast("Бонус уже получен сегодня");
    }
  }

  function handleBuyPremium(plan: "monthly" | "quarterly", withCoins: boolean) {
    const cost = PREMIUM_COST[plan];
    if (withCoins && !canAfford(cost)) {
      showToast(`Недостаточно монет. Нужно ${cost} ${COIN}`);
      return;
    }
    // In real app: payment. Here: demo mode for rubles, coins are real.
    const ok = buyPremium(plan, withCoins);
    if (ok) {
      if (plan === "quarterly") addCoins(200, "coins_purchase", "Бонус за квартальный план");
      showToast(`Premium активирован на ${PREMIUM_DAYS[plan]} дней!`);
    }
  }

  const premExpires = premium.expiresAt
    ? new Date(premium.expiresAt).toLocaleDateString("ru", { day: "numeric", month: "long" })
    : null;

  return (
    <div className={s.page}>
      {toast && <div className={s.toast}>{toast}</div>}

      <header className={s.header}>
        <button className={s.backBtn} onClick={() => navigate("/")}>← НАЗАД</button>
        <h1 className={s.title}>МАГАЗИН</h1>
        <div className={s.balance}>
          <span className={s.balanceIcon}>{COIN}</span>
          <span className={s.balanceNum}>{coins.toLocaleString("ru")}</span>
        </div>
      </header>

      <main className={s.main}>

        {/* Premium status banner */}
        {isPremium && (
          <div className={s.premiumBanner}>
            <span className={s.premiumBannerStar}>★</span>
            <div>
              <span className={s.premiumBannerTitle}>PREMIUM АКТИВЕН</span>
              <span className={s.premiumBannerSub}>До {premExpires}</span>
            </div>
          </div>
        )}

        {/* Daily bonus */}
        <section className={s.section}>
          <h2 className={s.sectionLabel}>ЕЖЕДНЕВНЫЙ БОНУС</h2>
          <div className={s.dailyCard}>
            <div className={s.dailyInfo}>
              <span className={s.dailyIcon}>{COIN}</span>
              <div>
                <span className={s.dailyAmount}>+{isPremium ? Math.round(DAILY_BONUS * 1.5) : DAILY_BONUS} монет</span>
                <span className={s.dailySub}>{isPremium ? "×1.5 с Premium" : "Каждый день бесплатно"}</span>
              </div>
            </div>
            <button className={s.dailyBtn} onClick={handleDailyBonus}>
              ПОЛУЧИТЬ
            </button>
          </div>
        </section>

        {/* Coin packs */}
        <section className={s.section}>
          <h2 className={s.sectionLabel}>МОНЕТЫ</h2>
          <div className={s.packsGrid}>
            {COIN_PACKS.map(pack => (
              <div
                key={pack.id}
                className={`${s.packCard} ${pack.popular ? s.packCardPopular : ""}`}
                style={{ "--pc": pack.color } as React.CSSProperties}
              >
                {pack.popular && <span className={s.packPopular}>ПОПУЛЯРНОЕ</span>}
                <span className={s.packIcon}>{COIN}</span>
                <span className={s.packCoins}>{pack.coins.toLocaleString("ru")}</span>
                <span className={s.packLabel}>{pack.label}</span>
                <button
                  className={s.packBtn}
                  onClick={() => pack.id === "starter" ? handleFreePack() : handleBuyPack(pack)}
                >
                  {pack.price}
                </button>
              </div>
            ))}
          </div>
          <p className={s.demoNote}>* Покупка за рубли работает в демо-режиме</p>
        </section>

        {/* Premium */}
        <section className={s.section}>
          <h2 className={s.sectionLabel}>PREMIUM ПОДПИСКА</h2>
          <div className={s.premiumGrid}>
            {PREMIUM_PLANS.map(plan => (
              <div
                key={plan.id}
                className={`${s.premiumCard} ${plan.highlight ? s.premiumCardHL : ""}`}
              >
                {plan.highlight && <span className={s.premiumHL}>ВЫГОДНЕЕ</span>}
                <h3 className={s.premiumPlanName}>{plan.label}</h3>
                <p className={s.premiumDays}>{plan.days} дней</p>

                <ul className={s.perkList}>
                  {plan.perks.map((p, i) => (
                    <li key={i} className={s.perk}>{p}</li>
                  ))}
                </ul>

                <div className={s.premiumBuyRow}>
                  <button
                    className={`${s.premiumBtn} ${!canAfford(plan.coinCost) ? s.premiumBtnDisabled : ""}`}
                    onClick={() => handleBuyPremium(plan.id as any, true)}
                    disabled={!canAfford(plan.coinCost)}
                    title={!canAfford(plan.coinCost) ? `Нужно ${plan.coinCost} монет` : ""}
                  >
                    {COIN} {plan.coinCost}
                  </button>
                  <span className={s.premiumOr}>или</span>
                  <button
                    className={s.premiumBtnRub}
                    onClick={() => handleBuyPremium(plan.id as any, false)}
                  >
                    {plan.rubCost}₽
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}
