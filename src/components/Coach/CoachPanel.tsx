import { useEffect, useRef, useState } from "react";
import CoachWorker from "../../chess/coachWorker?worker";
import type { CoachMoveRecord, CoachReport, MistakeType, CoachAnalysis } from "../../chess/coach";
import s from "./CoachPanel.module.css";

interface Props {
  records: CoachMoveRecord[];
  playerColor: "w" | "b";
  onClose: () => void;
}

const TYPE_CONFIG: Record<MistakeType, { icon: string; color: string; label: string }> = {
  blunder:    { icon: "☠", color: "#FF2D78", label: "БЛУНДЕР"   },
  mistake:    { icon: "⚠", color: "#FF6B1A", label: "ОШИБКА"    },
  inaccuracy: { icon: "◌", color: "#FFEE00", label: "НЕТОЧНОСТЬ" },
};

export function CoachPanel({ records, playerColor, onClose }: Props) {
  const [phase, setPhase]         = useState<"loading" | "done">("loading");
  const [progress, setProgress]   = useState(0);
  const [total, setTotal]         = useState(0);
  const [report, setReport]       = useState<CoachReport | null>(null);
  const [isExiting, setIsExiting] = useState(false);
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
      setReport({ analyses: [], blunders: 0, mistakes: 0, inaccuracies: 0, accuracy: 100 });
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
            <span className={s.headerSub}>Тренер разбирает партию</span>
          </div>
          <button className={s.closeBtn} onClick={handleClose}>✕</button>
        </div>

        {/* Loading */}
        {phase === "loading" && (
          <div className={s.loading}>
            <p className={s.loadingText}>
              Анализирую ход {progress + 1} из {total}...
            </p>
            <div className={s.progressTrack}>
              <div className={s.progressBar} style={{ width: `${pct}%` }} />
            </div>
            <p className={s.loadingHint}>Глубина поиска: 3 хода вперёд</p>
          </div>
        )}

        {/* Results */}
        {phase === "done" && report && (
          <div className={s.results}>
            {/* Accuracy score */}
            <div className={s.accuracyBlock}>
              <div className={s.accuracyRing}>
                <svg viewBox="0 0 60 60" width="80" height="80">
                  <circle cx="30" cy="30" r="24" fill="none" stroke="#111" strokeWidth="6" />
                  <circle
                    cx="30" cy="30" r="24"
                    fill="none"
                    stroke={report.accuracy >= 80 ? "#4caf50" : report.accuracy >= 60 ? "#FFEE00" : "#FF2D78"}
                    strokeWidth="6"
                    strokeDasharray={`${(report.accuracy / 100) * 150.8} 150.8`}
                    strokeDashoffset="37.7"
                    strokeLinecap="round"
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
                    <span style={{ color: "#FFEE00" }}>◌ {report.inaccuracies} неточност{report.inaccuracies === 1 ? "ь" : "и"}</span>
                  )}
                  {report.blunders === 0 && report.mistakes === 0 && report.inaccuracies === 0 && (
                    <span style={{ color: "#4caf50" }}>✓ Отличная партия!</span>
                  )}
                </div>
              </div>
            </div>

            <div className={s.divider} />

            {/* No mistakes */}
            {report.analyses.length === 0 && (
              <div className={s.noMistakes}>
                <span className={s.noMistakesIcon}>✓</span>
                <p className={s.noMistakesText}>
                  Серьёзных ошибок не найдено.<br />Хорошая игра!
                </p>
              </div>
            )}

            {/* Mistake list */}
            {report.analyses.map((a, i) => (
              <MistakeCard key={i} analysis={a} />
            ))}
          </div>
        )}
      </aside>
    </>
  );
}

function MistakeCard({ analysis }: { analysis: CoachAnalysis }) {
  const cfg = TYPE_CONFIG[analysis.type];
  const side = analysis.color === "w" ? "Белые" : "Чёрные";

  return (
    <div className={s.mistakeCard} style={{ "--mt": cfg.color } as React.CSSProperties}>
      {/* Type badge */}
      <div className={s.mistakeBadge} style={{ color: cfg.color, borderColor: `${cfg.color}44` }}>
        <span className={s.mistakeBadgeIcon}>{cfg.icon}</span>
        <span>{cfg.label}</span>
        <span className={s.mistakeMoveNum}>· Ход {analysis.moveNum} ({side})</span>
      </div>

      {/* Played vs Best */}
      <div className={s.moveCompare}>
        <div className={s.moveBox} style={{ borderColor: "#FF2D7844", background: "#120808" }}>
          <span className={s.moveBoxLabel}>Ты сходил</span>
          <span className={s.moveSan} style={{ color: "#FF2D78" }}>{analysis.playedSan}</span>
        </div>
        <span className={s.moveArrow}>→</span>
        <div className={s.moveBox} style={{ borderColor: "#4caf5044", background: "#081208" }}>
          <span className={s.moveBoxLabel}>Лучше было</span>
          <span className={s.moveSan} style={{ color: "#4caf50" }}>{analysis.bestSan}</span>
        </div>
      </div>

      {/* Eval drop */}
      <div className={s.evalBar}>
        <span className={s.evalLabel}>Потери: ~{Math.round(analysis.evalDrop / 100 * 10) / 10} пешки</span>
        <div className={s.evalTrack}>
          <div
            className={s.evalFill}
            style={{
              width: `${Math.min(100, analysis.evalDrop / 5)}%`,
              background: cfg.color,
            }}
          />
        </div>
      </div>

      {/* Tip */}
      <p className={s.tip}>{analysis.tip}</p>
    </div>
  );
}
