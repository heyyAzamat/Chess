import type React from "react";

const C = {
  aW: "#F0F4FF", aB: "#4A90D9", aG: "#C9A84C", aGl: "#89C4FF",
  nD: "#0A0A0F", nP: "#FF2D78", nO: "#FF6B1A",
  neu: "#4A0E8F", Y: "#FFEE00", skin: "#c8a882",
} as const;

const SS: React.CSSProperties = {
  position: "absolute", inset: 0, width: "100%", height: "100%",
};

// ── Character SVG groups ──────────────────────────────────────────────────────

function Valent({ x = 0, y = 0, h = 140, flip = false }: { x?: number; y?: number; h?: number; flip?: boolean }) {
  const w = h * 0.36;
  const cx = x + w / 2;
  const mirror = flip ? `scale(-1,1) translate(${-(2 * cx)},0)` : "";
  return (
    <g transform={mirror}>
      <polygon points={`${x + w * 0.1},${y + h * 0.05} ${x + w * 0.3},${y} ${x + w * 0.5},${y + h * 0.04} ${x + w * 0.7},${y} ${x + w * 0.9},${y + h * 0.05}`} fill={C.aG} />
      <rect x={x + w * 0.12} y={y + h * 0.05} width={w * 0.76} height={h * 0.2} fill={C.aW} rx="2" />
      <rect x={x - w * 0.15} y={y + h * 0.25} width={w * 0.15} height={h * 0.14} fill={C.aG} rx="1" />
      <rect x={x + w} y={y + h * 0.25} width={w * 0.15} height={h * 0.14} fill={C.aG} rx="1" />
      <rect x={x} y={y + h * 0.25} width={w} height={h * 0.58} fill={C.aW} rx="1" />
      <rect x={x} y={y + h * 0.38} width={w} height={h * 0.035} fill={C.aB} />
      <rect x={x + w * 0.08} y={y + h * 0.83} width={w * 0.35} height={h * 0.17} fill={C.aW} rx="1" />
      <rect x={x + w * 0.57} y={y + h * 0.83} width={w * 0.35} height={h * 0.17} fill={C.aW} rx="1" />
    </g>
  );
}

function Aela({ x = 0, y = 0, h = 140, flip = false, broken = false, kneeling = false }: { x?: number; y?: number; h?: number; flip?: boolean; broken?: boolean; kneeling?: boolean }) {
  const w = h * 0.3;
  const cx = x + w / 2;
  const mirror = flip ? `scale(-1,1) translate(${-(2 * cx)},0)` : "";
  const bodyH = kneeling ? h * 0.48 : h * 0.56;
  const bodyY = kneeling ? y + h * 0.42 : y + h * 0.28;
  return (
    <g transform={mirror}>
      <ellipse cx={x + w * 0.5} cy={y + h * 0.17} rx={w * 0.36} ry={h * 0.16} fill={C.aW} />
      <rect x={x + w * 0.12} y={y + h * 0.11} width={w * 0.76} height={h * 0.07} fill={C.aB} rx="1" />
      {broken && <line x1={x + w * 0.35} y1={y + h * 0.09} x2={x + w * 0.55} y2={y + h * 0.24} stroke="#fff" strokeWidth="1.8" />}
      <rect x={x + w * 0.08} y={bodyY} width={w * 0.84} height={bodyH} fill={C.aW} rx="1" />
      {!kneeling && <polygon points={`${x + w * 0.08},${y + h * 0.84} ${x - w * 0.1},${y + h} ${x + w * 0.5},${y + h * 0.72} ${x + w * 1.1},${y + h} ${x + w * 0.92},${y + h * 0.84}`} fill={C.aB} opacity="0.7" />}
      {kneeling && <ellipse cx={x + w * 0.5} cy={y + h * 0.94} rx={w * 0.55} ry={h * 0.06} fill={C.aW} opacity="0.5" />}
    </g>
  );
}

function Zed({ x = 0, y = 0, h = 130, flip = false }: { x?: number; y?: number; h?: number; flip?: boolean }) {
  const w = h * 0.32;
  const cx = x + w / 2;
  const mirror = flip ? `scale(-1,1) translate(${-(2 * cx)},0)` : "";
  return (
    <g transform={mirror}>
      <ellipse cx={x + w * 0.5} cy={y + h * 0.1} rx={w * 0.38} ry={h * 0.11} fill="#888" />
      <ellipse cx={x + w * 0.5} cy={y + h * 0.2} rx={w * 0.38} ry={h * 0.14} fill="#3a3a4a" />
      <rect x={x + w * 0.05} y={y + h * 0.32} width={w * 0.9} height={h * 0.52} fill="#2a2a3a" rx="1" />
      <rect x={x + w * 0.05} y={y + h * 0.44} width={w * 0.9} height={h * 0.03} fill={C.nO} />
      <rect x={x - w * 0.35} y={y + h * 0.32} width={w * 0.33} height={h * 0.45} fill={C.nO} rx="3" />
      <rect x={x - w * 0.32} y={y + h * 0.72} width={w * 0.27} height={h * 0.11} fill="#222" rx="2" />
      <polygon points={`${x + w * 0.05},${y + h * 0.84} ${x - w * 0.15},${y + h} ${x + w * 0.5},${y + h * 0.68} ${x + w * 1.15},${y + h} ${x + w * 0.95},${y + h * 0.84}`} fill="#1a1a2e" opacity="0.85" />
    </g>
  );
}

function Kira({ x = 0, y = 0, h = 140, flip = false, revealed = false }: { x?: number; y?: number; h?: number; flip?: boolean; revealed?: boolean }) {
  const w = h * 0.3;
  const cx = x + w / 2;
  const mirror = flip ? `scale(-1,1) translate(${-(2 * cx)},0)` : "";
  return (
    <g transform={mirror}>
      <ellipse cx={x + w * 0.5} cy={y + h * 0.22} rx={w * 0.55} ry={h * 0.24} fill="#111" />
      <rect x={x + w * 0.06} y={y + h * 0.38} width={w * 0.88} height={h * 0.52} fill="#111" rx="1" />
      <ellipse cx={x + w * 0.5} cy={y + h * 0.27} rx={w * 0.27} ry={h * 0.13} fill={revealed ? C.skin : C.nD} />
      {!revealed && <ellipse cx={x + w * 0.5} cy={y + h * 0.27} rx={w * 0.25} ry={h * 0.11} fill={C.nP} />}
      <ellipse cx={x + w * 0.5} cy={y + h * 0.22} rx={w * 0.55} ry={h * 0.24} fill="none" stroke={C.nP} strokeWidth="0.6" opacity="0.5" />
    </g>
  );
}

// ── Scene renderers ───────────────────────────────────────────────────────────

interface Props { sceneId: string; panelIndex: number }

export function PanelArtwork({ sceneId, panelIndex }: Props): React.ReactElement | null {

  switch (`${sceneId}/${panelIndex}`) {

    /* ── OPENING ── */
    case "opening/0":
      return (
        <svg viewBox="0 0 600 260" xmlns="http://www.w3.org/2000/svg" style={SS} aria-hidden="true">
          <rect width="600" height="260" fill="#07101a" />
          <rect x="305" width="295" height="260" fill="#0a0508" />
          <polygon points="285,0 315,0 315,260 285,260" fill="#000" />

          {/* Aurora spires */}
          {([40,90,148,200,248] as number[]).map((bx, i) => (
            <g key={i}>
              <rect x={bx} y={118 - i * 12} width={16 + i * 4} height={260} fill={C.aW} opacity="0.88" />
              <polygon points={`${bx},${118 - i * 12} ${bx + 8 + i * 2},${92 - i * 12} ${bx + 16 + i * 4},${118 - i * 12}`} fill={C.aG} />
              {i % 2 === 0 && <rect x={bx + 2} y={148 - i * 8} width={4} height={6} fill={C.aB} opacity="0.7" />}
            </g>
          ))}
          <ellipse cx="140" cy="75" rx="110" ry="38" fill={C.aGl} opacity="0.13" />

          {/* Nova towers */}
          {([330,378,428,478,535] as number[]).map((bx, i) => (
            <g key={i}>
              <rect x={bx} y={100 + i * 8} width={24} height={260} fill="#1a1a2e" />
              <rect x={bx} y={100 + i * 8} width={24} height="3" fill={i % 2 ? C.nP : C.nO} />
              {[0,1,2].map(j => (
                <rect key={j} x={bx + 3} y={120 + i * 8 + j * 28} width={8} height={4} fill={C.nP} opacity="0.5" />
              ))}
            </g>
          ))}
          <ellipse cx="450" cy="200" rx="95" ry="55" fill={C.nP} opacity="0.05" />

          <rect y="228" width="600" height="32" fill="#000" opacity="0.85" />
        </svg>
      );

    case "opening/1":
      return (
        <svg viewBox="0 0 600 290" xmlns="http://www.w3.org/2000/svg" style={SS} aria-hidden="true">
          <rect width="600" height="290" fill="#07101a" />
          <rect x="310" width="290" height="290" fill="#0a0508" />
          <rect x="282" width="36" height="290" fill="#000" />
          <line x1="300" y1="0" x2="300" y2="290" stroke="#222" strokeWidth="2" />

          <ellipse cx="160" cy="155" rx="65" ry="90" fill={C.aB} opacity="0.08" />
          <Valent x={65} y={65} h={175} />

          <ellipse cx="435" cy="160" rx="60" ry="85" fill={C.nO} opacity="0.09" />
          <Zed x={378} y={75} h={165} flip />

          {/* Gaze lines */}
          <line x1="220" y1="140" x2="282" y2="140" stroke={C.aB} strokeWidth="1" opacity="0.25" strokeDasharray="4 6" />
          <line x1="318" y1="140" x2="380" y2="140" stroke={C.nO} strokeWidth="1" opacity="0.25" strokeDasharray="4 6" />
        </svg>
      );

    case "opening/2":
      return (
        <svg viewBox="0 0 600 265" xmlns="http://www.w3.org/2000/svg" style={SS} aria-hidden="true">
          <rect width="600" height="265" fill="#14083a" />

          {/* Aurora speed lines */}
          {Array.from({ length: 14 }, (_, i) => {
            const y = 15 + i * 17;
            return <line key={i} x1="0" y1={y} x2={255 - i * 4} y2={y + 4} stroke={C.aB} strokeWidth={0.6 + (i % 3) * 0.3} opacity="0.45" />;
          })}
          {/* Nova speed lines */}
          {Array.from({ length: 14 }, (_, i) => {
            const y = 15 + i * 17;
            return <line key={i} x1="600" y1={y} x2={345 + i * 4} y2={y + 4} stroke={C.nP} strokeWidth={0.6 + (i % 3) * 0.3} opacity="0.45" />;
          })}

          {/* Aurora soldiers */}
          {([25, 65, 105, 148, 185] as number[]).map((bx, i) => (
            <g key={i}>
              <rect x={bx} y={140} width={22} height={75} fill={C.aW} opacity={0.65 + i * 0.06} />
              <rect x={bx + 2} y={124} width={18} height={19} fill={C.aW} opacity="0.8" />
              <polygon points={`${bx},124 ${bx + 11},108 ${bx + 22},124`} fill={C.aG} opacity="0.85" />
            </g>
          ))}

          {/* Nova soldiers */}
          {([415, 455, 495, 535, 568] as number[]).map((bx, i) => (
            <g key={i}>
              <rect x={bx} y={140} width={22} height={75} fill="#1a1a2e" opacity="0.9" />
              <rect x={bx + 2} y={124} width={18} height={19} fill="#222" />
              <rect x={bx} y={140} width={22} height="3" fill={C.nP} opacity="0.9" />
            </g>
          ))}

          {/* Collision glow center */}
          <ellipse cx="300" cy="170" rx="55" ry="40" fill={C.neu} opacity="0.22" />
          <ellipse cx="300" cy="170" rx="28" ry="18" fill={C.neu} opacity="0.35" />

          <rect y="228" width="600" height="37" fill="#000" opacity="0.8" />
        </svg>
      );

    /* ── CONFLICT ── */
    case "conflict/0":
      return (
        <svg viewBox="0 0 600 265" xmlns="http://www.w3.org/2000/svg" style={SS} aria-hidden="true">
          <rect width="600" height="265" fill="#0e0808" />

          {/* Fallen pieces */}
          {([
            { cx:85,  cy:198, rx:28, ry:10, c:C.aW,  r:-25 },
            { cx:160, cy:213, rx:22, ry: 8, c:"#222", r:15  },
            { cx:235, cy:188, rx:26, ry:10, c:C.aW,  r:-10 },
            { cx:335, cy:208, rx:24, ry: 9, c:"#222", r:20  },
            { cx:420, cy:195, rx:26, ry:10, c:C.aW,  r:-15 },
            { cx:500, cy:210, rx:20, ry: 8, c:"#1a1a1a", r:10 },
          ] as {cx:number;cy:number;rx:number;ry:number;c:string;r:number}[]).map((b, i) => (
            <ellipse key={i} cx={b.cx} cy={b.cy} rx={b.rx} ry={b.ry} fill={b.c} opacity="0.55" transform={`rotate(${b.r},${b.cx},${b.cy})`} />
          ))}

          {/* Fires */}
          {([120,255,375,490] as number[]).map((fx, i) => (
            <g key={i}>
              <ellipse cx={fx} cy={228} rx={20} ry={28} fill={C.nO} opacity="0.7" />
              <ellipse cx={fx} cy={215} rx={12} ry={20} fill={C.Y} opacity="0.55" />
              <ellipse cx={fx + 4} cy={208} rx={7} ry={13} fill="#fff" opacity="0.35" />
            </g>
          ))}

          {/* Smoke plumes */}
          {([100,230,355,465] as number[]).map((sx, i) => (
            <ellipse key={i} cx={sx} cy={158 - i * 5} rx={28} ry={16} fill="#2a2a2a" opacity="0.45" />
          ))}

          <rect y="230" width="600" height="35" fill="#090808" />
          <rect width="600" height="265" fill={C.nO} opacity="0.03" />
        </svg>
      );

    case "conflict/1":
      return (
        <svg viewBox="0 0 600 285" xmlns="http://www.w3.org/2000/svg" style={SS} aria-hidden="true">
          <rect width="600" height="285" fill="#080f1c" />

          {/* Light shaft */}
          <polygon points="250,0 350,0 420,285 180,285" fill={C.aB} opacity="0.05" />

          {/* Body on ground */}
          <ellipse cx="295" cy="255" rx="85" ry="18" fill="#111" opacity="0.85" />
          <ellipse cx="280" cy="250" rx="45" ry="11" fill="#1a1a2e" opacity="0.7" />

          <Aela x={215} y={95} h={165} />
          <ellipse cx="302" cy="178" rx="65" ry="95" fill={C.aB} opacity="0.09" />
          <ellipse cx="298" cy="120" rx="18" ry="9" fill={C.aB} opacity="0.28" />

          <rect y="248" width="600" height="37" fill="#000" opacity="0.7" />
        </svg>
      );

    case "conflict/2":
      return (
        <svg viewBox="0 0 600 285" xmlns="http://www.w3.org/2000/svg" style={SS} aria-hidden="true">
          <rect width="600" height="285" fill="#040408" />
          <polygon points="0,285 0,55 160,118 125,285" fill="#0a0a0f" />

          <Kira x={45} y={78} h={168} />
          <ellipse cx="118" cy="155" rx="22" ry="13" fill={C.nP} opacity="0.18" />
          <circle cx="145" cy="157" r="5" fill={C.nP} opacity="0.65" />

          {/* Scope line */}
          <line x1="148" y1="157" x2="528" y2="142" stroke={C.nP} strokeWidth="0.8" opacity="0.35" strokeDasharray="4 9" />
          <circle cx="528" cy="142" r="8" fill="none" stroke={C.nP} strokeWidth="0.8" opacity="0.3" />

          {/* Distant Aela silhouette */}
          <rect x="478" y="118" width="16" height="70" fill={C.aW} opacity="0.12" />
          <ellipse cx="486" cy="112" rx="10" ry="12" fill={C.aW} opacity="0.1" />

          <rect x="490" width="110" height="285" fill={C.nP} opacity="0.015" />
        </svg>
      );

    /* ── QUEEN CAPTURED ── */
    case "queen_captured/0":
      return (
        <svg viewBox="0 0 600 265" xmlns="http://www.w3.org/2000/svg" style={SS} aria-hidden="true">
          <rect width="600" height="265" fill="#080800" />

          {Array.from({ length: 26 }, (_, i) => {
            const a = (i / 26) * Math.PI * 2;
            const x1 = 300 + Math.cos(a) * 42, y1 = 132 + Math.sin(a) * 32;
            const x2 = 300 + Math.cos(a) * 330, y2 = 132 + Math.sin(a) * 290;
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={C.Y} strokeWidth={0.8 + (i % 3) * 0.4} opacity="0.55" />;
          })}

          <ellipse cx="300" cy="132" rx="90" ry="68" fill={C.Y} opacity="0.28" />
          <ellipse cx="300" cy="132" rx="50" ry="38" fill={C.Y} opacity="0.48" />
          <ellipse cx="300" cy="132" rx="22" ry="16" fill="#fff" opacity="0.85" />

          <ellipse cx="300" cy="132" rx="130" ry="98" fill="none" stroke={C.Y} strokeWidth="3" opacity="0.28" />
          <ellipse cx="300" cy="132" rx="195" ry="148" fill="none" stroke={C.Y} strokeWidth="1.5" opacity="0.14" />

          {([
            [192,75],[398,68],[158,168],[438,178],[246,38],[362,208],[115,132],[485,120],
          ] as [number,number][]).map(([px, py], i) => (
            <polygon key={i} points={`${px},${py} ${px + 9},${py - 7} ${px + 4},${py + 9}`} fill={i % 2 ? C.Y : "#fff"} opacity="0.7" />
          ))}
        </svg>
      );

    case "queen_captured/1":
      return (
        <svg viewBox="0 0 600 285" xmlns="http://www.w3.org/2000/svg" style={SS} aria-hidden="true">
          <rect width="600" height="285" fill="#080f1c" />
          <polygon points="268,0 332,0 395,285 205,285" fill={C.aB} opacity="0.05" />

          <Aela x={205} y={105} h={160} broken kneeling />
          <ellipse cx="288" cy="185" rx="82" ry="95" fill={C.aB} opacity="0.07" />

          {/* Mask fragments */}
          {([
            [248,180,0],[272,198,30],[345,182,-20],
          ] as [number,number,number][]).map(([fx, fy, fr], i) => (
            <polygon key={i} points={`${fx},${fy} ${fx + 13},${fy - 9} ${fx + 6},${fy + 11}`} fill={C.aW} opacity="0.48" transform={`rotate(${fr},${fx},${fy})`} />
          ))}

          {/* Young face */}
          <ellipse cx="293" cy="152" rx="24" ry="19" fill={C.skin} opacity="0.45" />

          <rect y="252" width="600" height="33" fill="#000" opacity="0.65" />
        </svg>
      );

    case "queen_captured/2":
      return (
        <svg viewBox="0 0 600 285" xmlns="http://www.w3.org/2000/svg" style={SS} aria-hidden="true">
          <rect width="600" height="285" fill="#080010" />
          <polygon points="240,0 360,0 390,285 210,285" fill={C.nP} opacity="0.04" />

          {/* Grid lines */}
          {Array.from({ length: 8 }, (_, i) => (
            <line key={i} x1={i * 86} y1="0" x2={i * 86} y2="285" stroke={C.nP} strokeWidth="0.3" opacity="0.12" />
          ))}

          <Kira x={175} y={55} h={190} revealed />
          <ellipse cx="268" cy="148" rx="38" ry="32" fill={C.nP} opacity="0.1" />

          {/* Mask held out */}
          <ellipse cx="258" cy="228" rx="32" ry="19" fill={C.nP} opacity="0.82" />
          <ellipse cx="258" cy="228" rx="26" ry="14" fill="#080010" opacity="0.35" />

          {/* Arm holding mask */}
          <rect x="220" y="192" width="14" height="44" fill={C.skin} opacity="0.55" rx="4" transform="rotate(-22,227,214)" />

          <ellipse cx="268" cy="165" rx="115" ry="128" fill={C.nP} opacity="0.05" />
        </svg>
      );

    case "queen_captured/3":
      return (
        <svg viewBox="0 0 600 285" xmlns="http://www.w3.org/2000/svg" style={SS} aria-hidden="true">
          <rect width="600" height="285" fill="#110400" />

          {/* Fires */}
          {([55,140,265,390,475,548] as number[]).map((fx, i) => (
            <g key={i}>
              <ellipse cx={fx} cy={268} rx={22 + i * 2} ry={55 + i * 4} fill={C.nO} opacity="0.48" />
              <ellipse cx={fx} cy={252} rx={13 + i} ry={38 + i * 3} fill={C.Y} opacity="0.28" />
            </g>
          ))}

          {/* Aurora HQ ruins */}
          <rect x="340" y="45" width="185" height="210" fill="#1a1a2e" opacity="0.55" />
          <rect x="362" y="25" width="42" height="230" fill="#0f0f20" opacity="0.65" />
          {/* Cracks */}
          <line x1="380" y1="45" x2="395" y2="145" stroke="#000" strokeWidth="3" />

          <Aela x={88} y={82} h={168} broken />
          <Kira x={362} y={82} h={168} flip />

          {/* Divider shadow */}
          <line x1="300" y1="0" x2="300" y2="285" stroke="#000" strokeWidth="5" opacity="0.45" />

          <ellipse cx="300" cy="165" rx="85" ry="62" fill={C.nO} opacity="0.08" />
          <rect y="258" width="600" height="27" fill="#000" opacity="0.7" />
        </svg>
      );

    /* ── CHECKMATE ── */
    case "checkmate/0":
      return (
        <svg viewBox="0 0 600 265" xmlns="http://www.w3.org/2000/svg" style={SS} aria-hidden="true">
          <rect width="600" height="265" fill="#050508" />

          {/* Bunker interior */}
          <rect x="178" y="18" width="244" height="238" fill="#0a0a14" />

          {/* Blown door frames */}
          <rect x="178" y="18" width="18" height="238" fill="#1a1a2e" />
          <rect x="404" y="18" width="18" height="238" fill="#1a1a2e" />
          <rect x="162" y="30" width="28" height="148" fill="#111" transform="rotate(-16,176,104)" />
          <rect x="410" y="24" width="28" height="148" fill="#111" transform="rotate(13,424,98)" />

          {/* Cold light from inside */}
          <ellipse cx="300" cy="128" rx="105" ry="92" fill={C.neu} opacity="0.1" />
          <polygon points="196,18 404,18 430,265 170,265" fill="#fff" opacity="0.015" />

          <Kira x={200} y={80} h={148} />
          <Zed x={305} y={90} h={135} />

          {/* Debris */}
          {([215,260,340,385] as number[]).map((dx, i) => (
            <polygon key={i} points={`${dx},${38 + i * 10} ${dx + 11},${28 + i * 8} ${dx + 5},${53 + i * 10}`} fill="#2a2a2a" opacity="0.5" />
          ))}

          <rect y="238" width="600" height="27" fill="#000" />
          <rect x="180" y="238" width="240" height="5" fill="#333" />
        </svg>
      );

    case "checkmate/1":
      return (
        <svg viewBox="0 0 600 285" xmlns="http://www.w3.org/2000/svg" style={SS} aria-hidden="true">
          <rect width="600" height="285" fill="#050810" />

          {/* Oracle screen */}
          <rect x="95" y="18" width="410" height="210" rx="4" fill="#08101e" />
          <rect x="102" y="25" width="396" height="196" rx="2" fill="#040a16" />

          {/* Screen data */}
          {Array.from({ length: 11 }, (_, i) => (
            <g key={i}>
              <rect x={114} y={35 + i * 17} width={100 + (i % 3) * 65} height="3" fill={C.aB} opacity={0.18 + (i % 3) * 0.09} />
              <rect x={225 + (i % 4) * 20} y={37 + i * 17} width={60 + (i % 2) * 40} height="2" fill={C.nP} opacity={0.08 + (i % 2) * 0.08} />
            </g>
          ))}

          <ellipse cx="300" cy="118" rx="205" ry="102" fill={C.aB} opacity="0.07" />

          <Valent x={222} y={145} h={128} />

          {/* Screen reflection of Valent */}
          <g opacity="0.18">
            <Valent x={222} y={35} h={85} />
          </g>
          <rect x="100" y="22" width="400" height="205" fill="#040a16" opacity="0.45" />

          <ellipse cx="300" cy="208" rx="155" ry="58" fill={C.aB} opacity="0.04" />

          <rect x="0" y="248" width="600" height="37" fill="#0e101a" />
          <rect x="0" y="246" width="600" height="3" fill="#1a1a30" />
        </svg>
      );

    case "checkmate/2":
      return (
        <svg viewBox="0 0 600 285" xmlns="http://www.w3.org/2000/svg" style={SS} aria-hidden="true">
          <rect width="600" height="285" fill="#080a10" />

          {/* Table */}
          <rect x="195" y="185" width="210" height="10" fill="#1a1a2e" rx="2" />
          <rect x="225" y="195" width="22" height="62" fill="#111" />
          <rect x="355" y="195" width="22" height="62" fill="#111" />

          <Zed x={52} y={95} h={158} />
          <rect x="42" y="238" width="86" height="8" fill="#1a1a2e" />

          <Valent x={382} y={95} h={158} flip />
          <rect x="382" y="238" width="86" height="8" fill="#1a1a2e" />

          {/* Center glow */}
          <ellipse cx="300" cy="185" rx="125" ry="82" fill={C.neu} opacity="0.07" />
          <ellipse cx="300" cy="178" rx="22" ry="9" fill="#fff" opacity="0.04" />

          <rect y="265" width="600" height="20" fill="#000" opacity="0.55" />
        </svg>
      );

    case "checkmate/3":
      return (
        <svg viewBox="0 0 600 305" xmlns="http://www.w3.org/2000/svg" style={SS} aria-hidden="true">
          <defs>
            <radialGradient id="dawnSun" cx="50%" cy="86%" r="52%">
              <stop offset="0%" stopColor={C.Y} stopOpacity="0.9" />
              <stop offset="35%" stopColor={C.nO} stopOpacity="0.55" />
              <stop offset="100%" stopColor={C.nO} stopOpacity="0" />
            </radialGradient>
            <linearGradient id="dawnSky" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0a0a1e" />
              <stop offset="45%" stopColor="#3a0d28" stopOpacity="0.8" />
              <stop offset="100%" stopColor={C.nO} stopOpacity="0.7" />
            </linearGradient>
          </defs>

          <rect width="600" height="305" fill="url(#dawnSky)" />
          <rect width="600" height="305" fill="url(#dawnSun)" />

          {/* Sun disc */}
          <ellipse cx="300" cy="265" rx="42" ry="25" fill={C.Y} opacity="0.9" />
          <ellipse cx="300" cy="268" rx="26" ry="15" fill="#fff" opacity="0.92" />

          {/* Sun rays */}
          {Array.from({ length: 14 }, (_, i) => {
            const a = (i / 14) * Math.PI * 2 - Math.PI / 2;
            return <line key={i} x1="300" y1="268" x2={300 + Math.cos(a) * 220} y2={268 + Math.sin(a) * 175} stroke={C.Y} strokeWidth="1.5" opacity="0.18" />;
          })}

          {/* City silhouettes */}
          {([
            [0,168,62,137],[52,135,28,170],[92,152,52,153],[168,118,42,187],
            [418,112,42,193],[462,138,58,167],[522,155,36,150],[558,128,42,177],
          ] as [number,number,number,number][]).map(([bx, by, bw, bh], i) => (
            <rect key={i} x={bx} y={by} width={bw} height={bh} fill="#000" opacity="0.92" />
          ))}

          {/* People silhouettes on rooftops */}
          {([95,158,225,292,368,428,498] as number[]).map((px, i) => (
            <g key={i}>
              <rect x={px} y={158} width={8} height={26} fill="#000" />
              <circle cx={px + 4} cy={153} r={5} fill="#000" />
              {i % 2 === 0 && (
                <>
                  <line x1={px} y1={170} x2={px - 9} y2={158} stroke="#000" strokeWidth="2.2" />
                  <line x1={px + 8} y1={170} x2={px + 17} y2={158} stroke="#000" strokeWidth="2.2" />
                </>
              )}
            </g>
          ))}

          <rect y="185" width="600" height="14" fill="#000" opacity="0.82" />
          <rect y="280" width="600" height="25" fill="#000" opacity="0.35" />
        </svg>
      );

    default:
      return null;
  }
}
