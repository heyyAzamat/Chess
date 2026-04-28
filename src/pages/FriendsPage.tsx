import { useState } from "react";
import { useNavigate } from "react-router-dom";
import s from "./SecondaryPage.module.css";

interface Friend {
  id: string;
  username: string;
  faction: "aurora" | "nova";
  rating: number;
  online: boolean;
  lastSeen?: string;
}

const MOCK_FRIENDS: Friend[] = [
  { id: "1", username: "GhostKira_00",  faction: "nova",   rating: 2724, online: true  },
  { id: "2", username: "ShadowFlash",   faction: "nova",   rating: 2341, online: true  },
  { id: "3", username: "BastionSigma",  faction: "aurora", rating: 2218, online: false, lastSeen: "3ч назад" },
  { id: "4", username: "ForceRider",    faction: "aurora", rating: 2105, online: true  },
  { id: "5", username: "ProphetEcho",   faction: "nova",   rating: 2190, online: false, lastSeen: "вчера" },
];

const F_COLOR = { aurora: "#4A90D9", nova: "#FF2D78" };
const F_LABEL = { aurora: "АВРОРА", nova: "НОВА" };

export function FriendsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"all" | "online">("all");

  const filtered = MOCK_FRIENDS.filter(f => {
    const matchSearch = f.username.toLowerCase().includes(search.toLowerCase());
    const matchTab = tab === "all" || f.online;
    return matchSearch && matchTab;
  });

  const onlineCount = MOCK_FRIENDS.filter(f => f.online).length;

  return (
    <div className={s.page}>
      <header className={s.header}>
        <button className={s.backBtn} onClick={() => navigate("/")}>← НАЗАД</button>
        <h1 className={s.pageTitle}>ДРУЗЬЯ</h1>
        <div />
      </header>

      <main className={s.main} style={{ maxWidth: 580 }}>
        {/* Search */}
        <input
          className={s.searchInput}
          type="text"
          placeholder="Поиск по позывному..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        {/* Tabs */}
        <div className={s.tabs}>
          <button
            className={`${s.tab} ${tab === "all" ? s.tabActive : ""}`}
            onClick={() => setTab("all")}
          >
            ВСЕ ({MOCK_FRIENDS.length})
          </button>
          <button
            className={`${s.tab} ${tab === "online" ? s.tabActive : ""}`}
            onClick={() => setTab("online")}
          >
            В СЕТИ ({onlineCount})
          </button>
        </div>

        {/* Friends list */}
        <div className={s.friendsList}>
          {filtered.length === 0 && (
            <p className={s.emptyText}>Никого не найдено</p>
          )}
          {filtered.map(friend => (
            <div key={friend.id} className={s.friendCard}>
              <div
                className={s.friendAvatar}
                style={{ background: F_COLOR[friend.faction], boxShadow: `0 0 12px ${F_COLOR[friend.faction]}` }}
              >
                {friend.username.slice(0, 2).toUpperCase()}
              </div>
              <div className={s.friendInfo}>
                <div className={s.friendNameRow}>
                  <span className={s.friendName}>{friend.username}</span>
                  {friend.online
                    ? <span className={s.onlineDot} title="В сети" />
                    : <span className={s.offlineText}>{friend.lastSeen}</span>
                  }
                </div>
                <div className={s.friendMeta}>
                  <span style={{ color: F_COLOR[friend.faction], fontSize: 9, letterSpacing: "0.1em" }}>
                    {F_LABEL[friend.faction]}
                  </span>
                  <span className={s.friendRating}>ЭЛО {friend.rating}</span>
                </div>
              </div>
              <div className={s.friendActions}>
                <button
                  className={s.actionBtn}
                  style={{ "--a": "#4A90D9" } as React.CSSProperties}
                  title="Вызов"
                  onClick={() => navigate("/game")}
                >
                  ⚔
                </button>
                <button
                  className={s.actionBtn}
                  style={{ "--a": "#666" } as React.CSSProperties}
                  title="Профиль"
                >
                  ◈
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add friend */}
        <div className={s.addFriendBox}>
          <p className={s.addFriendLabel}>ДОБАВИТЬ ДРУГА</p>
          <div className={s.addFriendRow}>
            <input className={s.searchInput} style={{ flex: 1 }} type="text" placeholder="Позывной..." />
            <button className={s.addBtn}>ДОБАВИТЬ</button>
          </div>
        </div>
      </main>
    </div>
  );
}
