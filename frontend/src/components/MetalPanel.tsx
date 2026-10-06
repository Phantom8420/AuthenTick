/** Procedural brushed-steel plating used as article art. `v` picks a layout. */
export function MetalPanel({ v = 0 }: { v?: number }) {
  const id = `mp${v}`;
  const flip = v % 2 === 1;
  return (
    <svg viewBox="0 0 400 310" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <defs>
        <linearGradient id={`${id}bg`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#4d6f71" />
          <stop offset=".55" stopColor="#233f41" />
          <stop offset="1" stopColor="#0f2324" />
        </linearGradient>
        <linearGradient id={`${id}edge`} x1="0" y1="0" x2="1" y2="0">
          <stop stopColor="#cfe6e5" stopOpacity=".95" />
          <stop offset="1" stopColor="#7aa7a6" stopOpacity=".15" />
        </linearGradient>
        <linearGradient id={`${id}plate`} x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#6e9293" stopOpacity=".55" />
          <stop offset="1" stopColor="#1a3234" stopOpacity=".2" />
        </linearGradient>
        <radialGradient id={`${id}glow`} cx=".25" cy=".1" r=".8">
          <stop stopColor="#a9ecea" stopOpacity=".35" />
          <stop offset="1" stopColor="#a9ecea" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="400" height="310" fill={`url(#${id}bg)`} />
      <g transform={flip ? "translate(400 0) scale(-1 1)" : undefined}>
        {/* brushed streaks */}
        {Array.from({ length: 26 }, (_, i) => (
          <rect key={i} x={i * 16 + (v * 7) % 11} y="0" width="1" height="310" fill="#fff" opacity={0.018 + (i % 4) * 0.01} />
        ))}

        {/* tall panel with chamfered corner */}
        <path d="M70 -10h110v250l-30 40H70z" fill={`url(#${id}plate)`} stroke="#0b1b1c" strokeWidth="3" />
        <path d="M70 -10v290" stroke={`url(#${id}edge)`} strokeWidth="2" />
        <path d="M180 -10v250l-30 40" stroke="#0b1b1c" strokeWidth="3" fill="none" />
        <path d="M150 280 180 240" stroke={`url(#${id}edge)`} strokeWidth="2" />

        {/* inset slot + lights */}
        <rect x="94" y="46" width="62" height="12" rx="3" fill="#0a1819" stroke="#7aa7a6" strokeOpacity=".4" />
        <rect x="94" y="70" width="38" height="6" rx="2" fill="#0a1819" />
        <rect x="94" y="84" width="24" height="6" rx="2" fill="#0a1819" />
        <circle cx="140" cy="130" r="4" fill="#8fe3df" opacity=".85" />

        {/* wedge plate */}
        <path d="M180 60 330 20v120l-150 60z" fill="#1d3739" stroke="#0b1b1c" strokeWidth="3" />
        <path d="M180 60 330 20" stroke={`url(#${id}edge)`} strokeWidth="2.500" />
        <path d="M196 92 316 58" stroke="#0a1819" strokeWidth="6" strokeLinecap="round" opacity=".7" />
        <path d="M196 112 300 80" stroke="#7aa7a6" strokeOpacity=".28" strokeWidth="2" />

        {/* lower slab */}
        <path d="M200 232 400 170v140H200z" fill="#13292b" stroke="#0b1b1c" strokeWidth="3" />
        <path d="M200 232 400 170" stroke={`url(#${id}edge)`} strokeWidth="2" />
        <rect x="236" y="250" width="70" height="8" rx="3" fill="#0a1819" />
        <rect x="236" y="266" width="44" height="8" rx="3" fill="#0a1819" />
      </g>
      <rect width="400" height="310" fill={`url(#${id}glow)`} />
      <rect width="400" height="310" fill="#031010" opacity=".18" />
    </svg>
  );
}
