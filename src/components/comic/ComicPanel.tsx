import type { ComicPanel as ComicPanelData, NarrativeData } from "../../narrative/narrative.types";
import { DialogueBubble } from "./DialogueBubble";
import { SpeedLines } from "./SpeedLines";
import styles from "./ComicViewer.module.css";

interface Props {
  panel: ComicPanelData;
  narrative: NarrativeData;
  sceneId: string;
}

const MOOD_COLORS: Record<string, string> = {
  "establishing":      "#1A1A2E",
  "confrontation":     "#0D0D1A",
  "action-start":      "#2D0A4E",
  "chaos":             "#1A0A0A",
  "cold-victory":      "#0A1A2E",
  "tension":           "#0A0A14",
  "shock":             "#1A1400",
  "vulnerability":     "#1A1220",
  "revelation":        "#1A0015",
  "recognition":       "#1A0800",
  "finale":            "#0A0A0F",
  "defeat-quiet":      "#0D1020",
  "quiet-resolution":  "#0F1218",
  "ambiguous-hope":    "#0D1520",
  "fire-orange":       "#1A0800",
  "aurora-broken":     "#0A1022",
};

const ACTION_MOODS = new Set(["shock", "action-start", "chaos"]);

function getMoodColor(mood: string): string {
  return MOOD_COLORS[mood] ?? "#1A1A2E";
}

export function ComicPanel({ panel, narrative, sceneId }: Props) {
  const isAction = ACTION_MOODS.has(panel.visual.mood);
  const isFinale = panel.isFinale;
  const bg = getMoodColor(panel.visual.mood);

  const auroraGlow = narrative.factions.white.theme.glow;
  const novaGlow   = narrative.factions.black.theme.glow;

  const dominantGlow =
    panel.visual.colorDominant.includes("aurora") ? auroraGlow :
    panel.visual.colorDominant.includes("nova")   ? novaGlow   :
    panel.visual.colorDominant === "impact-yellow" ? "#FFEE00"  :
    panel.visual.colorDominant === "dawn"           ? "#FF6B35"  :
    "#4A0E8F";

  return (
    <div
      className={`${styles.panel} ${isFinale ? styles.panelFinale : ""}`}
      style={{ "--panel-bg": bg, "--panel-glow": dominantGlow } as React.CSSProperties}
    >
      {/* Visual area */}
      <div className={styles.panelVisual}>
        {isAction && <SpeedLines color={dominantGlow} opacity={0.5} />}

        <div className={styles.halftone} />

        <div
          className={styles.panelGlow}
          style={{ background: `radial-gradient(ellipse at center, ${dominantGlow}22 0%, transparent 70%)` }}
        />

        <p className={styles.panelDescription}>{panel.visual.description}</p>

        <div
          className={styles.moodBadge}
          style={{ color: dominantGlow, borderColor: dominantGlow }}
        >
          {panel.visual.mood.toUpperCase().replace(/-/g, " ")}
        </div>
      </div>

      {/* Caption */}
      {panel.caption && (
        <div className={`${styles.caption} ${isFinale ? styles.captionFinale : ""}`}>
          {panel.caption.split("\n\n").map((block, i) => (
            <p key={i}>{block}</p>
          ))}
        </div>
      )}

      {/* Dialogues */}
      {panel.dialogues.length > 0 && (
        <div className={styles.dialogues}>
          {panel.dialogues.map((d, i) => (
            <DialogueBubble
              key={i}
              dialogue={d}
              narrative={narrative}
              index={i}
            />
          ))}
        </div>
      )}
    </div>
  );
}
