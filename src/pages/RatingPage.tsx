import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, loadUsers } from "../contexts/AuthContext";
import s from "./SecondaryPage.module.css";

interface RatingEntry {
  id: string;
  username: string;
  faction: "aurora" | "nova";
  rating: number;
  wins: number;
  losses: number;
  gamesPlayed: number;
}

const F_COLOR = { aurora: "#4A90D9", nova: "#FF2D78" };
const F_LABEL = { aurora: "АВР",     nova: "НОВ"     };

function winRate(wins: number, total: number) {
  return total > 0 ? Math.round((wins / total) * 100) : 0;
}

export function RatingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Перечитываем при каждом изменении user (после партии)
  const entries = useMemo((): RatingEntry[] => {
    const stored = loadUsers();
    return Object.values(stored)
      .map(({ user: u }) => ({
        id:          u.id,
        username:    u.username,
        faction:     u.faction,
        rating:      u.rating,
        wins:        u.wins,
        losses:      u.losses,
        gamesPlayed: u.gamesPlayed ?? (u.wins + u.losses + u.draws),
      }))
      .sort((a, b) => b.rating - a.rating);
  }, [user]);

  const auroraCount = entries.filter(e => e.faction === "aurora").length;
  const novaCount   = entries.filter(e => e.faction === "nova").length;

  return (
    <div className={s.page}>
      <header className={s.header}>
        <button className={s.backBtn} onClick={() => navigate("/")}>← НАЗАД</button>
        <h1 className={s.pageTitle}>РЕЙТИНГ</h1>
        <div />
      </header>

      <main className={s.main} style={{ maxWidth: 680 }}>

        {/* Faction totals */}
        <div className={s.ratingFactions}>
          {(["aurora", "nova"] as const).map(f => {
            const count = f === "aurora" ? auroraCount : novaCount;
            const top   = entries.find(e => e.faction === f);
            return (
              <div key={f} className={s.ratingFaction} style={{ "--c": F_COLOR[f] } as React.CSSProperties}>
                <span className={s.ratingFactionName}>
                  {f === "aurora" ? "АВРОРА" : "НОВА"}
                </span>
                <span className={s.ratingFactionCount}>{count} агентов</span>
                {top && (
                  <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 10, color: "#555", marginTop: 2 }}>
                    Лидер: {top.username} ({top.rating})
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Empty state */}
        {entries.length === 0 && (
          <div style={{ textAlign: "center", padding: "48px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
            <p style={{ fontFamily: "'Bangers', cursive", fontSize: 24, color: "#333", letterSpacing: "0.1em" }}>
              ТАБЛИЦА ПУСТА
            </p>
            <p style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 12, color: "#444" }}>
              Сыграй партию — твой рейтинг появится здесь
            </p>
          </div>
        )}

        {/* Leaderboard */}
        {entries.length > 0 && (
          <table className={s.table}>
            <thead>
              <tr className={s.tableHead}>
                <th className={s.th} style={{ width: 40 }}>#</th>
                <th className={s.th} style={{ textAlign: "left" }}>ИГРОК</th>
                <th className={s.th}>ЭЛО</th>
                <th className={s.th}>В / П</th>
                <th className={s.th}>%</th>
                <th className={s.th}>ИГР</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, idx) => {
                const rank = idx + 1;
                const isMe = entry.username === user?.username;
                const wr   = winRate(entry.wins, entry.gamesPlayed);

                return (
                  <tr key={entry.id} className={`${s.tableRow} ${isMe ? s.tableRowUser : ""}`}>
                    <td className={s.td} style={{ textAlign: "center" }}>
                      <RankIcon rank={rank} />
                    </td>

                    <td className={s.td}>
                      <div className={s.playerCell}>
                        <span className={s.factionPip} style={{ background: F_COLOR[entry.faction] }} />
                        <span className={s.playerName} style={{ color: isMe ? "#FFEE00" : undefined }}>
                          {entry.username}
                        </span>
                        <span className={s.factionTag} style={{ color: F_COLOR[entry.faction] }}>
                          {F_LABEL[entry.faction]}
                        </span>
                        {isMe && <span className={s.youTag}>ВЫ</span>}
                      </div>
                    </td>

                    <td className={s.td} style={{ textAlign: "center" }}>
                      <span className={s.ratingNum} style={{ color: isMe ? "#FFEE00" : undefined }}>
                        {entry.rating}
                      </span>
                    </td>

                    <td className={s.td} style={{ textAlign: "center", fontSize: 12 }}>
                      <span style={{ color: "#4caf50" }}>{entry.wins}</span>
                      <span style={{ color: "#555" }}>/</span>
                      <span style={{ color: "#f44336" }}>{entry.losses}</span>
                    </td>

                    <td className={s.td} style={{ textAlign: "center" }}>
                      <WinRateBar pct={wr} />
                    </td>

                    <td className={s.td} style={{ textAlign: "center", color: "#555", fontSize: 11 }}>
                      {entry.gamesPlayed}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </main>
    </div>
  );
}

function RankIcon({ rank }: { rank: number }) {
  if (rank === 1) return <span style={{ color: "#FFD700", fontSize: 18 }}>★</span>;
  if (rank === 2) return <span style={{ color: "#C0C0C0", fontSize: 18 }}>★</span>;
  if (rank === 3) return <span style={{ color: "#CD7F32", fontSize: 18 }}>★</span>;
  return <span style={{ color: "#444", fontSize: 13, fontFamily: "'Share Tech Mono', monospace" }}>{rank}</span>;
}

function WinRateBar({ pct }: { pct: number }) {
  const color = pct >= 60 ? "#4caf50" : pct >= 40 ? "#FFEE00" : "#f44336";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5, justifyContent: "center" }}>
      <div style={{ width: 36, height: 4, background: "#1a1a2e", borderRadius: 2, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color }} />
      </div>
      <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 10, color: "#666", minWidth: 26 }}>
        {pct}%
      </span>
    </div>
  );
}
