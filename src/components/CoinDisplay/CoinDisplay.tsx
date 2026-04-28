import { useNavigate } from "react-router-dom";
import { useCurrency, COIN } from "../../contexts/CurrencyContext";
import s from "./CoinDisplay.module.css";

interface Props {
  size?: "sm" | "md";
  showShop?: boolean;
}

export function CoinDisplay({ size = "md", showShop = true }: Props) {
  const { coins, isPremium } = useCurrency();
  const navigate = useNavigate();

  return (
    <button
      className={`${s.wrap} ${s[size]}`}
      onClick={() => showShop && navigate("/shop")}
      title={showShop ? "Открыть магазин" : undefined}
      style={{ cursor: showShop ? "pointer" : "default" }}
    >
      {isPremium && <span className={s.star}>★</span>}
      <span className={s.icon}>{COIN}</span>
      <span className={s.amount}>{coins.toLocaleString("ru")}</span>
      {showShop && <span className={s.plus}>+</span>}
    </button>
  );
}
