import { useEffect, useRef, useState } from "react";
import { ChessPiece } from "../pieces/ChessPiece";
import type { StoryMoment } from "../../narrative/storyScript";
import s from "./StoryPanel.module.css";

interface Props {
  moment: StoryMoment;
  duration?: number; // ms before auto-close
  onDone: () => void;
  onReady: (durationMs: number) => void;
}

const FACTION_COLORS = {
  aurora: { primary: "#4A90D9", glow: "#4A90D944", accent: "#C9A84C", label: "АВРОРА" },
  nova:   { primary: "#FF2D78", glow: "#FF2D7833", accent: "#FF6B1A", label: "НОВА"   },
};

const MOOD_STYLES: Record<string, { bg: string; border: string }> = {
  cold:    { bg: "#07101a", border: "#4A90D9" },
  intense: { bg: "#12070f", border: "#FF2D78" },
  quiet:   { bg: "#0a0d0a", border: "#4caf50" },
  shock:   { bg: "#1a0f00", border: "#FF6B1A" },
  dark:    { bg: "#080808", border: "#555"    },
  hopeful: { bg: "#0a1200", border: "#FFEE00" },
  broken:  { bg: "#100508", border: "#FF2D78" },
};

export function StoryPanel({ moment, duration = 5200, onDone, onReady }: Props) {
  const [phase, setPhase]       = useState<"in" | "show" | "out">("in");
  const [progress, setProgress] = useState(100);
  const intervalRef             = useRef<ReturnType<typeof setInterval> | null>(null);

  const fc    = FACTION_COLORS[moment.faction];
  const mood  = MOOD_STYLES[moment.mood] ?? MOOD_STYLES.dark;

  // Slide in → start timer → slide out
  useEffect(() => {
    // Enter phase
    const enterT = setTimeout(() => {
      setPhase("show");
      onReady(duration);

      // Progress bar countdown
      const step = 100 / (duration / 80);
      intervalRef.current = setInterval(() => {
        setProgress(p => {
          if (p <= step) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            return 0;
          }
          return p - step;
        });
      }, 80);
    }, 50);

    return () => {
      clearTimeout(enterT);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [duration, onReady]);

  function handleDismiss() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setPhase("out");
    setTimeout(onDone, 320);
  }

  return (
    <div
      className={`${s.panel} ${phase === "in" ? s.panelIn : phase === "out" ? s.panelOut : s.panelShow}`}
      style={{ "--border": mood.border, "--bg": mood.bg, "--glow": fc.glow } as React.CSSProperties}
    >
      {/* Halftone */}
      <div className={s.halftone} />

      {/* Faction bar */}
      <div className={s.factionBar} style={{ background: fc.primary }}>
        <span className={s.factionLabel}>{fc.label} · {moment.title}</span>
        <button className={s.closeBtn} onClick={handleDismiss} aria-label="Закрыть">✕</button>
      </div>

      {/* Body */}
      <div className={s.body}>
        {/* Portrait */}
        <div className={s.portrait}>
          <ChessPiece
            type={moment.pieceType}
            color={moment.pieceColor}
            size={68}
            glowIntensity="medium"
          />
          <div className={s.portraitGlow} style={{ background: `radial-gradient(circle, ${fc.glow} 0%, transparent 70%)` }} />
        </div>

        {/* Dialogue */}
        <div className={s.dialogueWrap}>
          <p className={s.charName} style={{ color: fc.primary }}>{moment.character}</p>
          <div className={s.bubble}>
            <div className={s.bubbleTail} style={{ borderTopColor: "#1a1a2e" }} />
            <p className={s.bubbleText}>{moment.dialogue}</p>
          </div>
        </div>
      </div>

      {/* Caption */}
      {moment.caption && (
        <p className={s.caption}>{moment.caption}</p>
      )}

      {/* Progress bar */}
      <div className={s.progressTrack}>
        <div
          className={s.progressBar}
          style={{ width: `${progress}%`, background: fc.primary }}
        />
      </div>
    </div>
  );
}
