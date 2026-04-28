import type { Dialogue } from "../../narrative/narrative.types";
import type { NarrativeData } from "../../narrative/narrative.types";
import styles from "./ComicViewer.module.css";

interface Props {
  dialogue: Dialogue;
  narrative: NarrativeData;
  index: number;
}

export function DialogueBubble({ dialogue, narrative, index }: Props) {
  const faction = dialogue.faction === "aurora"
    ? narrative.factions.white
    : narrative.factions.black;

  const isLeft = index % 2 === 0;

  return (
    <div
      className={`${styles.bubble} ${isLeft ? styles.bubbleLeft : styles.bubbleRight}`}
      style={{
        "--bubble-glow": faction.theme.glow,
        "--bubble-accent": faction.theme.secondary,
        animationDelay: `${index * 0.15}s`,
      } as React.CSSProperties}
    >
      <span className={styles.bubbleSpeaker}>{dialogue.character}</span>
      <p className={styles.bubbleText}>{dialogue.bubble}</p>
      <div className={`${styles.bubbleTail} ${isLeft ? styles.tailLeft : styles.tailRight}`} />
    </div>
  );
}
