// Decorative arcs and glowing nodes for the brand panel, echoing the connected-network feel of the logo.
const arcs = [
  'M -40 640 Q 200 470 460 560 T 820 520',
  'M -40 560 Q 260 400 520 470 T 820 430',
  'M -40 720 Q 300 560 600 640 T 820 610',
]

const nodes: Array<[number, number]> = [
  [70, 570],
  [200, 498],
  [300, 548],
  [420, 612],
  [495, 490],
  [560, 655],
  [715, 572],
]

export default function NetworkBackdrop() {
  return (
    <svg className="network-backdrop" viewBox="0 0 768 1024" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <radialGradient id="node-glow">
          <stop offset="0%" stopColor="#b9f27c" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#b9f27c" stopOpacity="0" />
        </radialGradient>
      </defs>
      {arcs.map((d) => (
        <path key={d} d={d} fill="none" stroke="#8ccf55" strokeOpacity="0.28" strokeWidth="1.2" />
      ))}
      {nodes.map(([cx, cy]) => (
        <g key={`${cx}-${cy}`}>
          <circle cx={cx} cy={cy} r="14" fill="url(#node-glow)" />
          <circle cx={cx} cy={cy} r="2.6" fill="#d8ffb0" />
        </g>
      ))}
    </svg>
  )
}
