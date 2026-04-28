interface Props {
  color?: string;
  opacity?: number;
}

export function SpeedLines({ color = "#FFEE00", opacity = 0.6 }: Props) {
  const lines = Array.from({ length: 24 }, (_, i) => {
    const angle = (i / 24) * 360;
    const rad = (angle * Math.PI) / 180;
    const x2 = 50 + Math.cos(rad) * 60;
    const y2 = 50 + Math.sin(rad) * 60;
    const strokeWidth = i % 3 === 0 ? 1.5 : 0.5;
    return { x2, y2, strokeWidth, angle };
  });

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid slice"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        opacity,
      }}
    >
      {lines.map((l, i) => (
        <line
          key={i}
          x1="50"
          y1="50"
          x2={l.x2}
          y2={l.y2}
          stroke={color}
          strokeWidth={l.strokeWidth}
        />
      ))}
      <circle cx="50" cy="50" r="4" fill={color} opacity="0.9" />
    </svg>
  );
}
