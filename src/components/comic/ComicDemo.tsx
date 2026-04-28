import { useState } from "react";
import { ComicViewer } from "./ComicViewer";
import { useComicTrigger } from "./useComicTrigger";
import { getNarrativeData } from "../../narrative/narrative.service";

export function ComicDemo() {
  const { activeScene, closeScene, onGameStart, onMove, onCapture, onCheckmate } =
    useComicTrigger();

  const narrative = getNarrativeData();

  const btnStyle: React.CSSProperties = {
    fontFamily: "'Bangers', cursive",
    fontSize: 16,
    letterSpacing: "0.08em",
    padding: "8px 20px",
    background: "#111",
    color: "#FFEE00",
    border: "2px solid #FFEE00",
    cursor: "pointer",
    clipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)",
    transition: "all 0.15s",
  };

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "#0A0A0F",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        fontFamily: "'Share Tech Mono', monospace",
        padding: 24,
      }}
    >
      <h1
        style={{
          fontFamily: "'Bangers', cursive",
          fontSize: 36,
          color: "#FFEE00",
          textShadow: "0 0 20px #FFEE0066",
          letterSpacing: "0.1em",
          margin: 0,
        }}
      >
        {narrative.title}
      </h1>

      <p style={{ color: "#555", fontSize: 12, margin: 0, letterSpacing: "0.15em" }}>
        ДЕМО КОМИКС-ПАНЕЛЕЙ — нажми кнопку чтобы показать сцену
      </p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center", marginTop: 16 }}>
        <button style={btnStyle} onClick={onGameStart}>
          ▶ НАЧАЛО ИГРЫ
        </button>
        <button style={btnStyle} onClick={() => onMove(10)}>
          ⚔ ХОД 10
        </button>
        <button style={{ ...btnStyle, color: "#FF2D78", borderColor: "#FF2D78" }} onClick={() => onCapture("queen")}>
          ♛ ВЗЯТИЕ ФЕРЗЯ
        </button>
        <button style={{ ...btnStyle, color: "#FF6B1A", borderColor: "#FF6B1A" }} onClick={onCheckmate}>
          ☠ МАТ
        </button>
      </div>

      {activeScene && (
        <ComicViewer scene={activeScene} onClose={closeScene} />
      )}
    </div>
  );
}
