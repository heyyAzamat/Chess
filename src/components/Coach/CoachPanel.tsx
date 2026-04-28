import { useEffect, useRef, useState } from "react";
import CoachWorker from "../../chess/coachWorker?worker";
import type { CoachMoveRecord, CoachReport, MistakeType, CoachAnalysis, GamePhase, TacticType } from "../../chess/coach";
import { MiniBoard } from "./MiniBoard";
import s from "./CoachPanel.module.css";

interface Props {
  records:     CoachMoveRecord[];
  playerColor: "w" | "b";
  onClose:     () => void;
}

const MISTAKE_CFG: Record<MistakeType, { icon: string; color: string; label: string }> = {
  blunder:    { icon: "☠", color: "#FF2D78", label: "БЛУНДЕР"    },
  mistake:    { icon: "⚠", color: "#FF6B1A", label: "ОШИБКА"     },
  inaccuracy: { icon: "◌", color: "#FFEE00", label: "НЕТОЧНОСТЬ"  },
};

const PHASE_LABELS: Record<GamePhase, string> = {
  opening:    "Дебют",
  middlegame: "Миттельшпиль",
  endgame:    "Эндшпиль",
};
const PHASE_ICONS: Record<GamePhase, string> = {
  opening: "📖", middlegame: "⚔", endgame: "♔",
};

const TACTIC_LABELS: Record<TacticType, string> = {
  fork:       "ВИЛКА",
  hanging:    "ЗЕВОК",
  capture:    "ВЗЯТИЕ",
  check:      "ШАХ",
  promotion:  "ПРЕВРАЩЕНИЕ",
  castling:   "РОКИРОВКА",
  positional: "ПОЗИЦИЯ",
};

// ── Main component ────────────────────────────────────────────────────────────

export function CoachPanel({ records, playerColor, onClose }: Props) {
  const [phase,     setPhase]     = useState<"loading" | "done">("loading");
  const [progress,  setProgress]  = useState(0);
  const [total,     setTotal]     = useState(0);
  const [report,    setReport]    = useState<CoachReport | null>(null);
  const [isExiting, setIsExiting] = useState(false);
  const [tab,       setTab]       = useState<"mistakes" | "phases">("mistakes");
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    const playerMoves = records.filter(r => r.color === playerColor).length;
    setTotal(playerMoves);

    const worker = new CoachWorker();
    workerRef.current = worker;

    worker.onmessage = (e: MessageEvent<{ type: string; done?: number; total?: number; report?: CoachReport }>) => {
      if (e.data.type === "progress") {
        setProgress(e.data.done ?? 0);
        setTotal(e.data.total ?? playerMoves);
      } else if (e.data.type === "result" && e.data.report) {
        setReport(e.data.report);
        setPhase("done");
        worker.terminate();
        workerRef.current = null;
      }
    };

    worker.onerror = () => {
      setPhase("done");
      setReport({ analyses: [], blunders: 0, mistakes: 0, inaccuracies: 0, accuracy: 100, phaseStats: { opening: { blunders:0,mistakes:0,inaccuracies:0,moves:0 }, middlegame: { blunders:0,mistakes:0,inaccuracies:0,moves:0 }, endgame: { blunders:0,mistakes:0,inaccuracies:0,moves:0 } }, topTip: "" });
    };

    worker.postMessage({ records, playerColor, depth: 3 });
    return () => { worker.terminate(); };
  }, []);

  function handleClose() {
    setIsExiting(true);
    workerRef.current?.terminate();
    setTimeout(onClose, 320);
  }

  const pct = total > 0 ? Math.round((progress / total) * 100) : 0;

  return (
    <>
      <div className={s.backdrop} onClick={handleClose} />
      <aside className={`${s.panel} ${isExiting ? s.panelOut : s.panelIn}`}>

        {/* Header */}
        <div className={s.header}>
          <span className={s.headerIcon}>🧠</span>
          <div className={s.headerText}>
            <span className={s.headerTitle}>АНАЛИЗ ИИ</span>
            <span className={s.headerSub}>
              {phase === "loading" ? "Тренер разбирает партию..." : "Разбор готов"}
            </span>
          </div>
          <button className={s.closeBtn} onClick={handleClose}>✕</button>
        </div>

        {/* Loading */}
        {phase === "loading" && (
          <div className={s.loading}>
            <div className={s.loadingSpinner}>
              {["◐","◓","◑","◒"].map((c, i) => (
                <span key={i} className={s.spinChar} style={{ animationDelay: `${i * 0.15}s` }}>{c}</span>
              ))}
            </div>
            <p className={s.loadingText}>
              Анализирую ход {Math.min(progress + 1, total)} из {total}
            </p>
            <div className={s.progressTrack}>
              <div className={s.progressBar} style={{ width: `${pct}%` }} />
            </div>
            <p className={s.loadingHint}>Глубина поиска: 3 хода вперёд · Минимакс + α-β</p>
          </div>
        )}

        {/* Results */}
        {phase === "done" && report && (
          <div className={s.results}>

            {/* Accuracy ring */}
            <div className={s.accuracyBlock}>
              <div className={s.accuracyRing}>
                <svg viewBox="0 0 64 64" width="84" height="84">
                  <circle cx="32" cy="32" r="26" fill="none" stroke="#111" strokeWidth="6" />
                  <circle
                    cx="32" cy="32" r="26"
                    fill="none"
                    stroke={report.accuracy >= 80 ? "#4caf50" : report.accuracy >= 55 ? "#FFEE00" : "#FF2D78"}
                    strokeWidth="6"
                    strokeDasharray={`${(report.accuracy / 100) * 163.4} 163.4`}
                    strokeDashoffset="40.8"
                    strokeLinecap="round"
                    style={{ transition: "stroke-dasharray 0.8s ease" }}
                  />
                </svg>
                <span className={s.accuracyNum}>{report.accuracy}%</span>
              </div>

              <div className={s.accuracyStats}>
                <span className={s.accuracyLabel}>ТОЧНОСТЬ ИГРЫ</span>
                <div className={s.mistakeSummary}>
                  {report.blunders > 0 && (
                    <span style={{ color: "#FF2D78" }}>☠ {report.blunders} блундер{report.blunders > 1 ? "а" : ""}</span>
                  )}
                  {report.mistakes > 0 && (
                    <span style={{ color: "#FF6B1A" }}>⚠ {report.mistakes} ошибк{report.mistakes === 1 ? "а" : "и"}</span>
                  )}
                  {report.inaccuracies > 0 && (
                    <span style={{ color: "#FFEE00" }}>◌ {report.inaccuracies} неточн{report.inaccuracies === 1 ? "ость" : "ости"}</span>
                  )}
                  {report.blunders === 0 && report.mistakes === 0 && report.inaccuracies === 0 && (
                    <span style={{ color: "#4caf50" }}>✓ Чистая партия!</span>
                  )}
                </div>
              </div>
            </div>

            {/* Top tip */}
            {report.topTip && (
              <div className={s.topTip}>
                <span className={s.topTipIcon}>💡</span>
                <p className={s.topTipText}>{report.topTip}</p>
              </div>
            )}

            {/* Tabs */}
            <div className={s.tabs}>
              <button
                className={`${s.tab} ${tab === "mistakes" ? s.tabActive : ""}`}
                onClick={() => setTab("mistakes")}
              >
                РАЗБОР ХОДОВ
              </button>
              <button
                className={`${s.tab} ${tab === "phases" ? s.tabActive : ""}`}
                onClick={() => setTab("phases")}
              >
                ПО ФАЗАМ
              </button>
            </div>

            {/* Mistakes tab */}
            {tab === "mistakes" && (
              <>
                {report.analyses.length === 0 ? (
                  <div className={s.noMistakes}>
                    <span className={s.noMistakesIcon}>✓</span>
                    <p className={s.noMistakesText}>Серьёзных ошибок не найдено.<br />Отличная игра!</p>
                  </div>
                ) : (
                  report.analyses.map((a, i) => (
                    <MistakeCard key={i} analysis={a} index={i} />
                  ))
                )}
              </>
            )}

            {/* Phases tab */}
            {tab === "phases" && (
              <div className={s.phasesBlock}>
                {(["opening","middlegame","endgame"] as GamePhase[]).map(ph => {
                  const st = report.phaseStats[ph];
                  const total = st.blunders + st.mistakes + st.inaccuracies;
                  return (
                    <div key={ph} className={s.phaseCard}>
                      <div className={s.phaseHeader}>
                        <span className={s.phaseIcon}>{PHASE_ICONS[ph]}</span>
                        <span className={s.phaseLabel}>{PHASE_LABELS[ph]}</span>
                        <span className={s.phaseMoves}>{st.moves} ходов</span>
                      </div>
                      <div className={s.phaseErrors}>
                        {total === 0 ? (
                          <span className={s.phaseClean}>✓ Без ошибок</span>
                        ) : (
                          <>
                            {st.blunders > 0 && <span style={{ color: "#FF2D78" }}>☠ ×{st.blunders}</span>}
                            {st.mistakes > 0 && <span style={{ color: "#FF6B1A" }}>⚠ ×{st.mistakes}</span>}
                            {st.inaccuracies > 0 && <span style={{ color: "#FFEE00" }}>◌ ×{st.inaccuracies}</span>}
                          </>
                        )}
                      </div>
                      <div className={s.phaseBar}>
                        <div
                          className={s.phaseBarFill}
                          style={{
                            width: `${st.moves > 0 ? Math.min(100, (total / st.moves) * 100) : 0}%`,
                            background: total === 0 ? "#4caf50" : total >= 3 ? "#FF2D78" : "#FFEE00",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        )}
      </aside>
    </>
  );
}

// ── Mistake card ──────────────────────────────────────────────────────────────

function MistakeCard({ analysis, index }: { analysis: CoachAnalysis; index: number }) {
  const [expanded, setExpanded] = useState(index === 0);
  const cfg = MISTAKE_CFG[analysis.type];
  const side = analysis.color === "w" ? "Белые" : "Чёрные";
  const phase = PHASE_LABELS[analysis.phase];
  const tactic = TACTIC_LABELS[analysis.tactic];

  return (
    <div className={s.mistakeCard} style={{ "--mt": cfg.color } as React.CSSProperties}>
      {/* Header row */}
      <button className={s.mistakeHeader} onClick={() => setExpanded(e => !e)}>
        <div className={s.mistakeBadge} style={{ color: cfg.color, borderColor: `${cfg.color}44` }}>
          <span>{cfg.icon}</span>
          <span>{cfg.label}</span>
        </div>
        <div className={s.mistakeMeta}>
          <span className={s.mistakeMoveNum}>Ход {analysis.moveNum} · {side}</span>
          <span className={s.mistakePhase}>{phase}</span>
        </div>
        <span className={s.tacticTag} style={{ color: cfg.color, borderColor: `${cfg.color}33` }}>{tactic}</span>
        <span className={s.expandIcon}>{expanded ? "▲" : "▼"}</span>
      </button>

      {/* Quick summary (always visible) */}
      <div className={s.quickSummary}>
        <span className={s.moveSanBad}>{analysis.playedSan}</span>
        <span className={s.moveArrow}>→</span>
        <span className={s.moveSanGood}>{analysis.bestSan}</span>
        <span className={s.evalDrop}>−{(analysis.evalDrop / 100).toFixed(1)}♙</span>
      </div>

      {/* Expanded: mini-board + tip */}
      {expanded && (
        <div className={s.mistakeExpanded}>
          <MiniBoard
            fen={analysis.fenBefore}
            playedFrom={analysis.playedFrom}
            playedTo={analysis.playedTo}
            bestFrom={analysis.bestFrom}
            bestTo={analysis.bestTo}
          />

          <div className={s.moveCompare}>
            <div className={s.moveBox} style={{ borderColor: "#FF2D7844", background: "#120808" }}>
              <span className={s.moveBoxLabel}>Ты сходил</span>
              <span className={s.moveSan} style={{ color: "#FF2D78" }}>{analysis.playedSan}</span>
            </div>
            <span className={s.moveArrowBig}>→</span>
            <div className={s.moveBox} style={{ borderColor: "#4caf5044", background: "#081208" }}>
              <span className={s.moveBoxLabel}>Лучше было</span>
              <span className={s.moveSan} style={{ color: "#4caf50" }}>{analysis.bestSan}</span>
            </div>
          </div>

          <div className={s.evalBar}>
            <span className={s.evalLabel}>Потеря: ~{(analysis.evalDrop / 100).toFixed(1)} пешки</span>
            <div className={s.evalTrack}>
              <div
                className={s.evalFill}
                style={{ width: `${Math.min(100, analysis.evalDrop / 5)}%`, background: cfg.color }}
              />
            </div>
          </div>

          <p className={s.tip}>{analysis.tip}</p>
        </div>
      )}
    </div>
  );
}

