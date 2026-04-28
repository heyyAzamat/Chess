import type { ChessColor, PieceType } from "../../narrative/narrative.types";

interface Props {
  type: PieceType;
  color: ChessColor;
  size?: number;
  glowIntensity?: "low" | "medium" | "high";
  onClick?: () => void;
  selected?: boolean;
}

const AURORA = { fill: "#E8EEF8", stroke: "#000", glow: "#89C4FF", accent: "#C9A84C" };
const NOVA   = { fill: "#1A1A2E", stroke: "#000", glow: "#FF2D78", accent: "#FF6B1A" };

/* ── Path data (NeoInk style — bold outlines, flat shapes) ── */

function KingPath({ c }: { c: typeof AURORA }) {
  return (
    <g>
      {/* Body */}
      <rect x="18" y="52" width="44" height="28" rx="2" fill={c.fill} stroke={c.stroke} strokeWidth="3" />
      {/* Shoulders */}
      <rect x="12" y="44" width="56" height="14" rx="2" fill={c.fill} stroke={c.stroke} strokeWidth="3" />
      {/* Neck */}
      <rect x="30" y="28" width="20" height="20" rx="2" fill={c.fill} stroke={c.stroke} strokeWidth="3" />
      {/* Crown base */}
      <rect x="22" y="18" width="36" height="14" rx="1" fill={c.fill} stroke={c.stroke} strokeWidth="3" />
      {/* Crown spikes */}
      <polygon points="22,18 28,4 34,18" fill={c.fill} stroke={c.stroke} strokeWidth="2.5" />
      <polygon points="36,18 40,2 44,18" fill={c.accent} stroke={c.stroke} strokeWidth="2.5" />
      <polygon points="46,18 52,4 58,18" fill={c.fill} stroke={c.stroke} strokeWidth="2.5" />
      {/* Base */}
      <rect x="10" y="78" width="60" height="8" rx="2" fill={c.fill} stroke={c.stroke} strokeWidth="3" />
      {/* Crown gem */}
      <circle cx="40" cy="10" r="4" fill={c.accent} stroke={c.stroke} strokeWidth="2" />
      {/* Cross on chest */}
      <rect x="37" y="56" width="6" height="16" rx="1" fill={c.accent} />
      <rect x="32" y="62" width="16" height="4" rx="1" fill={c.accent} />
    </g>
  );
}

function QueenPath({ c }: { c: typeof AURORA }) {
  return (
    <g>
      {/* Body */}
      <path d="M16 80 Q20 54 40 50 Q60 54 64 80 Z" fill={c.fill} stroke={c.stroke} strokeWidth="3" />
      {/* Waist */}
      <ellipse cx="40" cy="52" rx="14" ry="5" fill={c.fill} stroke={c.stroke} strokeWidth="2.5" />
      {/* Neck */}
      <rect x="33" y="30" width="14" height="24" rx="3" fill={c.fill} stroke={c.stroke} strokeWidth="3" />
      {/* Crown base */}
      <rect x="20" y="20" width="40" height="13" rx="2" fill={c.fill} stroke={c.stroke} strokeWidth="3" />
      {/* Crown orbs */}
      <circle cx="22" cy="16" r="6" fill={c.fill} stroke={c.stroke} strokeWidth="2.5" />
      <circle cx="33" cy="12" r="6" fill={c.fill} stroke={c.stroke} strokeWidth="2.5" />
      <circle cx="40" cy="10" r="7" fill={c.accent} stroke={c.stroke} strokeWidth="2.5" />
      <circle cx="47" cy="12" r="6" fill={c.fill} stroke={c.stroke} strokeWidth="2.5" />
      <circle cx="58" cy="16" r="6" fill={c.fill} stroke={c.stroke} strokeWidth="2.5" />
      {/* Inner orb gems */}
      <circle cx="22" cy="16" r="2.5" fill={c.glow} opacity="0.8" />
      <circle cx="40" cy="10" r="3" fill={c.stroke} />
      <circle cx="58" cy="16" r="2.5" fill={c.glow} opacity="0.8" />
      {/* Base */}
      <rect x="10" y="78" width="60" height="8" rx="2" fill={c.fill} stroke={c.stroke} strokeWidth="3" />
      {/* Dress lines */}
      <line x1="28" y1="60" x2="22" y2="78" stroke={c.stroke} strokeWidth="1.5" opacity="0.4" />
      <line x1="40" y1="58" x2="40" y2="78" stroke={c.stroke} strokeWidth="1.5" opacity="0.4" />
      <line x1="52" y1="60" x2="58" y2="78" stroke={c.stroke} strokeWidth="1.5" opacity="0.4" />
    </g>
  );
}

function RookPath({ c }: { c: typeof AURORA }) {
  return (
    <g>
      {/* Main tower */}
      <rect x="20" y="36" width="40" height="44" rx="2" fill={c.fill} stroke={c.stroke} strokeWidth="3" />
      {/* Top battlements */}
      <rect x="16" y="22" width="12" height="18" rx="1" fill={c.fill} stroke={c.stroke} strokeWidth="3" />
      <rect x="34" y="22" width="12" height="18" rx="1" fill={c.fill} stroke={c.stroke} strokeWidth="3" />
      <rect x="52" y="22" width="12" height="18" rx="1" fill={c.fill} stroke={c.stroke} strokeWidth="3" />
      {/* Battlement connector */}
      <rect x="16" y="36" width="48" height="6" rx="0" fill={c.fill} stroke={c.stroke} strokeWidth="2" />
      {/* Arrow slit */}
      <rect x="36" y="48" width="8" height="18" rx="1" fill={c.stroke} />
      <rect x="33" y="55" width="14" height="5" rx="1" fill={c.stroke} />
      {/* Side reinforcements */}
      <rect x="16" y="50" width="6" height="22" rx="1" fill={c.accent} stroke={c.stroke} strokeWidth="1.5" />
      <rect x="58" y="50" width="6" height="22" rx="1" fill={c.accent} stroke={c.stroke} strokeWidth="1.5" />
      {/* Base */}
      <rect x="10" y="78" width="60" height="8" rx="2" fill={c.fill} stroke={c.stroke} strokeWidth="3" />
    </g>
  );
}

function BishopPath({ c }: { c: typeof AURORA }) {
  return (
    <g>
      {/* Robe body */}
      <path d="M14 82 Q18 54 40 48 Q62 54 66 82 Z" fill={c.fill} stroke={c.stroke} strokeWidth="3" />
      {/* Mitre (hat) */}
      <path d="M28 34 Q32 12 40 6 Q48 12 52 34 Z" fill={c.fill} stroke={c.stroke} strokeWidth="3" />
      {/* Hat band */}
      <rect x="26" y="32" width="28" height="7" rx="1" fill={c.accent} stroke={c.stroke} strokeWidth="2" />
      {/* Collar */}
      <ellipse cx="40" cy="46" rx="13" ry="5" fill={c.fill} stroke={c.stroke} strokeWidth="2.5" />
      {/* Orb on top */}
      <circle cx="40" cy="8" r="5" fill={c.accent} stroke={c.stroke} strokeWidth="2" />
      {/* Robe decoration */}
      <line x1="40" y1="48" x2="40" y2="78" stroke={c.accent} strokeWidth="2" />
      <path d="M30 62 Q40 58 50 62" fill="none" stroke={c.accent} strokeWidth="1.5" />
      {/* Base */}
      <rect x="10" y="78" width="60" height="8" rx="2" fill={c.fill} stroke={c.stroke} strokeWidth="3" />
    </g>
  );
}

function KnightPath({ c }: { c: typeof AURORA }) {
  return (
    <g>
      {/* Body / neck */}
      <rect x="24" y="54" width="30" height="26" rx="3" fill={c.fill} stroke={c.stroke} strokeWidth="3" />
      {/* Head */}
      <path d="M20 54 Q22 28 38 20 Q56 16 60 34 Q62 46 54 54 Z" fill={c.fill} stroke={c.stroke} strokeWidth="3" />
      {/* Snout */}
      <path d="M38 40 Q30 44 28 54 L38 54 Z" fill={c.fill} stroke={c.stroke} strokeWidth="2.5" />
      {/* Eye */}
      <circle cx="48" cy="32" r="5" fill={c.stroke} />
      <circle cx="49.5" cy="30.5" r="1.5" fill="#fff" />
      {/* Mane */}
      <path d="M38 20 Q44 30 42 46" fill="none" stroke={c.accent} strokeWidth="3" strokeLinecap="round" />
      <path d="M44 18 Q52 28 50 44" fill="none" stroke={c.accent} strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      {/* Nostril */}
      <circle cx="32" cy="50" r="2" fill={c.stroke} opacity="0.6" />
      {/* Armor plate */}
      <path d="M24 64 L54 64" stroke={c.accent} strokeWidth="2" opacity="0.8" />
      {/* Base */}
      <rect x="10" y="78" width="60" height="8" rx="2" fill={c.fill} stroke={c.stroke} strokeWidth="3" />
    </g>
  );
}

function PawnPath({ c }: { c: typeof AURORA }) {
  return (
    <g>
      {/* Body */}
      <path d="M22 80 Q24 62 40 58 Q56 62 58 80 Z" fill={c.fill} stroke={c.stroke} strokeWidth="3" />
      {/* Neck */}
      <rect x="34" y="44" width="12" height="16" rx="2" fill={c.fill} stroke={c.stroke} strokeWidth="2.5" />
      {/* Head */}
      <circle cx="40" cy="36" r="14" fill={c.fill} stroke={c.stroke} strokeWidth="3" />
      {/* Helmet line */}
      <path d="M26 34 Q40 28 54 34" fill="none" stroke={c.accent} strokeWidth="2.5" />
      {/* Visor */}
      <path d="M30 38 Q40 42 50 38" fill="none" stroke={c.stroke} strokeWidth="2" />
      {/* Base */}
      <rect x="10" y="78" width="60" height="8" rx="2" fill={c.fill} stroke={c.stroke} strokeWidth="3" />
    </g>
  );
}

const PIECE_COMPONENTS: Record<PieceType, React.ComponentType<{ c: typeof AURORA }>> = {
  king:   KingPath,
  queen:  QueenPath,
  rook:   RookPath,
  bishop: BishopPath,
  knight: KnightPath,
  pawn:   PawnPath,
};

const GLOW_OPACITY: Record<"low" | "medium" | "high", number> = {
  low: 0.25, medium: 0.5, high: 0.85,
};

export function ChessPiece({
  type,
  color,
  size = 80,
  glowIntensity = "medium",
  onClick,
  selected = false,
}: Props) {
  const c = color === "white" ? AURORA : NOVA;
  const PieceSVG = PIECE_COMPONENTS[type];
  const glowOp = GLOW_OPACITY[glowIntensity];

  return (
    <svg
      viewBox="0 0 80 90"
      width={size}
      height={size * (90 / 80)}
      onClick={onClick}
      style={{
        cursor: onClick ? "pointer" : "default",
        filter: selected
          ? `drop-shadow(0 0 8px ${c.glow}) drop-shadow(0 0 20px ${c.glow})`
          : `drop-shadow(0 0 4px ${c.glow}${Math.round(glowOp * 255).toString(16).padStart(2, "0")})`,
        transition: "filter 0.2s ease",
        display: "block",
      }}
      aria-label={`${color === "white" ? "Аврора" : "Нова"} — ${type}`}
    >
      {/* Halftone shadow base */}
      <ellipse cx="40" cy="84" rx="26" ry="4" fill="#000" opacity="0.35" />

      {/* Piece geometry */}
      <PieceSVG c={c} />

      {/* Selected ring */}
      {selected && (
        <ellipse
          cx="40" cy="84" rx="28" ry="5"
          fill="none"
          stroke={c.glow}
          strokeWidth="2"
          opacity="0.9"
        />
      )}
    </svg>
  );
}
