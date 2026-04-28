import { useState, useEffect, useCallback } from "react";
import type { ComicScene } from "../../narrative/narrative.types";
import { getNarrativeData } from "../../narrative/narrative.service";
import { ComicPanel } from "./ComicPanel";
import styles from "./ComicViewer.module.css";

interface Props {
  scene: ComicScene;
  onClose: () => void;
}

export function ComicViewer({ scene, onClose }: Props) {
  const [currentPanel, setCurrentPanel] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const narrative = getNarrativeData();

  const total = scene.panels.length;
  const isFirst = currentPanel === 0;
  const isLast = currentPanel === total - 1;

  const goNext = useCallback(() => {
    if (isLast) {
      handleClose();
    } else {
      setCurrentPanel((p) => p + 1);
    }
  }, [isLast]);

  const goPrev = useCallback(() => {
    if (!isFirst) setCurrentPanel((p) => p - 1);
  }, [isFirst]);

  const handleClose = useCallback(() => {
    setIsExiting(true);
    setTimeout(onClose, 400);
  }, [onClose]);

  useEffect(() => {
    setCurrentPanel(0);
    setIsExiting(false);
  }, [scene.id]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
      if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); goNext(); }
      if (e.key === "ArrowLeft") { e.preventDefault(); goPrev(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleClose, goNext, goPrev]);

  const panel = scene.panels[currentPanel];

  return (
    <div
      className={`${styles.overlay} ${isExiting ? styles.overlayExit : styles.overlayEnter}`}
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-label={scene.title}
    >
      <div
        className={styles.viewer}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.sceneTitle}>{scene.title}</span>
            <span className={styles.narrativeTitle}>{narrative.title}</span>
          </div>
          <div className={styles.pageDots}>
            {scene.panels.map((_, i) => (
              <button
                key={i}
                className={`${styles.dot} ${i === currentPanel ? styles.dotActive : ""}`}
                onClick={() => setCurrentPanel(i)}
                aria-label={`Панель ${i + 1}`}
              />
            ))}
          </div>
          <button className={styles.closeBtn} onClick={handleClose} aria-label="Закрыть">
            ✕
          </button>
        </header>

        {/* Panel */}
        <main
          className={styles.panelWrap}
          key={`${scene.id}-${currentPanel}`}
        >
          <ComicPanel
            panel={panel}
            narrative={narrative}
            sceneId={scene.id}
          />
        </main>

        {/* Footer navigation */}
        <footer className={styles.footer}>
          <button
            className={`${styles.navBtn} ${styles.navBtnPrev}`}
            onClick={goPrev}
            disabled={isFirst}
          >
            ← НАЗАД
          </button>

          <span className={styles.pageCounter}>
            {currentPanel + 1} / {total}
          </span>

          <button
            className={`${styles.navBtn} ${styles.navBtnNext}`}
            onClick={goNext}
          >
            {isLast ? "ПРОДОЛЖИТЬ →" : "ДАЛЕЕ →"}
          </button>
        </footer>
      </div>
    </div>
  );
}
