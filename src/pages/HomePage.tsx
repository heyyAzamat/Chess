import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import s from "./HomePage.module.css";

const MENU_ITEMS: { id: string; label: string; sub: string; icon: string; path: string; color: string; glow: string; big?: boolean }[] = [
  {
    id: "play",
    label: "ИГРАТЬ",
    sub: "Сразиться с ботом",
    icon: "⚔",
    path: "/play",
    color: "#FFEE00",
    glow: "#FFEE0044",
    big: true,
  },
  {
    id: "characters",
    label: "ПЕРСОНАЖИ",
    sub: "Лор и характеры",
    icon: "♛",
    path: "/characters",
    color: "#4A90D9",
    glow: "#4A90D922",
  },
  {
    id: "rating",
    label: "РЕЙТИНГ",
    sub: "Таблица лидеров",
    icon: "★",
    path: "/rating",
    color: "#C9A84C",
    glow: "#C9A84C22",
  },
  {
    id: "friends",
    label: "ДРУЗЬЯ",
    sub: "Союзники и соперники",
    icon: "◈",
    path: "/friends",
    color: "#FF6B1A",
    glow: "#FF6B1A22",
  },
  {
    id: "settings",
    label: "НАСТРОЙКИ",
    sub: "Параметры системы",
    icon: "⚙",
    path: "/settings",
    color: "#888",
    glow: "#88888822",
  },
];

const FACTION_COLOR = { aurora: "#4A90D9", nova: "#FF2D78" } as const;
const FACTION_LABEL = { aurora: "АВРОРА", nova: "НОВА" } as const;

export function HomePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const totalGames = (user?.wins ?? 0) + (user?.losses ?? 0) + (user?.draws ?? 0);
  const winRate = totalGames > 0
    ? Math.round(((user?.wins ?? 0) / totalGames) * 100)
    : 0;

  return (
    <div className={s.page}>
      <div className={s.bg} />

      {/* User header */}
      <header className={s.header}>
        <div className={s.userCard}>
          <div
            className={s.avatar}
            style={{
              background: user?.faction ? FACTION_COLOR[user.faction] : "#333",
              boxShadow: `0 0 16px ${user?.faction ? FACTION_COLOR[user.faction] : "#333"}`,
            }}
          >
            {user?.avatar}
          </div>
          <div className={s.userInfo}>
            <span className={s.username}>{user?.username}</span>
            {user?.faction && (
              <span className={s.factionBadge} style={{ color: FACTION_COLOR[user.faction] }}>
                ◈ {FACTION_LABEL[user.faction]}
              </span>
            )}
          </div>
          <div className={s.userStats}>
            <div className={s.stat}>
              <span className={s.statNum}>{user?.rating ?? 1200}</span>
              <span className={s.statLabel}>ЭЛО</span>
            </div>
            <div className={s.statSep} />
            <div className={s.stat}>
              <span className={s.statNum}>{user?.wins ?? 0}</span>
              <span className={s.statLabel}>ПОБЕДЫ</span>
            </div>
            <div className={s.statSep} />
            <div className={s.stat}>
              <span className={s.statNum}>{winRate}%</span>
              <span className={s.statLabel}>ВИНРЕЙТ</span>
            </div>
          </div>
          <button className={s.logoutBtn} onClick={logout} title="Выйти">
            ⏻
          </button>
        </div>
      </header>

      {/* Main title */}
      <div className={s.titleBlock}>
        <p className={s.titleSub}>ПРОТОКОЛ ВОЙНЫ · ЭДЕМ-0</p>
        <h1 className={s.title}>ВЫБЕРИ ДЕЙСТВИЕ</h1>
      </div>

      {/* Menu grid */}
      <nav className={s.menu}>
        {/* Big play button */}
        {MENU_ITEMS.filter(i => i.big).map(item => (
          <button
            key={item.id}
            className={`${s.menuItem} ${s.menuItemBig}`}
            style={{ "--item-color": item.color, "--item-glow": item.glow } as React.CSSProperties}
            onClick={() => navigate(item.path)}
          >
            <span className={s.menuIcon}>{item.icon}</span>
            <div className={s.menuText}>
              <span className={s.menuLabel}>{item.label}</span>
              <span className={s.menuSub}>{item.sub}</span>
            </div>
            <span className={s.menuArrow}>→</span>
          </button>
        ))}

        {/* Smaller items grid */}
        <div className={s.menuGrid}>
          {MENU_ITEMS.filter(i => !i.big).map(item => (
            <button
              key={item.id}
              className={s.menuItem}
              style={{ "--item-color": item.color, "--item-glow": item.glow } as React.CSSProperties}
              onClick={() => navigate(item.path)}
            >
              <span className={s.menuIcon}>{item.icon}</span>
              <div className={s.menuText}>
                <span className={s.menuLabel}>{item.label}</span>
                <span className={s.menuSub}>{item.sub}</span>
              </div>
            </button>
          ))}
        </div>
      </nav>

      <p className={s.footer}>ЭДЕМ-ЗЕРО · ПРОТОКОЛ ВОЙНЫ · 2187</p>
    </div>
  );
}
