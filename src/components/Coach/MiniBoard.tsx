import { Chess } from "chess.js";
import s from "./CoachPanel.module.css";

const PIECES: Record<string, string> = {
  wk:"♔", wq:"♕", wr:"♖", wb:"♗", wn:"♘", wp:"♙",
  bk:"♚", bq:"♛", br:"♜", bb:"♝", bn:"♞", bp:"♟",
};

const FILES = ["a","b","c","d","e","f","g","h"];

interface Props {
  fen: string;
  playedFrom: string;
  playedTo: string;
  bestFrom: string;
  bestTo: string;
}

export function MiniBoard({ fen, playedFrom, playedTo, bestFrom, bestTo }: Props) {
  let board: ReturnType<Chess["board"]>;
  try {
    board = new Chess(fen).board();
  } catch {
    return null;
  }

  return (
    <div className={s.miniBoard}>
      {[8,7,6,5,4,3,2,1].map(rank =>
        FILES.map((file, col) => {
          const sq = `${file}${rank}`;
          const row = 8 - rank;
          const piece = board[row][col];
          const isLight = (rank + col) % 2 === 1;

          const isPlayedFrom = sq === playedFrom;
          const isPlayedTo   = sq === playedTo;
          const isBestFrom   = sq === bestFrom;
          const isBestTo     = sq === bestTo;

          let highlight = "";
          if (isPlayedFrom || isPlayedTo) highlight = s.sqPlayed;
          else if (isBestFrom || isBestTo) highlight = s.sqBest;

          const key = piece ? `${piece.color}${piece.type}` : null;

          return (
            <div
              key={sq}
              className={`${s.miniSq} ${isLight ? s.miniSqLight : s.miniSqDark} ${highlight}`}
            >
              {key && (
                <span className={piece!.color === "w" ? s.pieceW : s.pieceB}>
                  {PIECES[key]}
                </span>
              )}
              {isPlayedTo && (
                <span className={s.sqBadgePlayed} title="Сыгранный ход">✕</span>
              )}
              {isBestTo && (
                <span className={s.sqBadgeBest} title="Лучший ход">✓</span>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
