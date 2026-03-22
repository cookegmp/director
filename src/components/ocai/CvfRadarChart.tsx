interface CvfRadarChartProps {
  clan: number
  adhocracy: number
  hierarchy: number
  market: number
  size?: number
}

function CvfRadarChart({ clan, adhocracy, hierarchy, market, size = 240 }: CvfRadarChartProps) {
  const padding = 50
  const chartSize = size
  const totalSize = chartSize + padding * 2
  const cx = totalSize / 2
  const cy = totalSize / 2
  const r = chartSize / 2 - 10

  // Axes: top=Clan, right=Adhocracy, bottom=Market, left=Hierarchy
  const axes = [
    { label: 'Clan', value: clan, angle: -90 },
    { label: 'Adhocracy', value: adhocracy, angle: 0 },
    { label: 'Market', value: market, angle: 90 },
    { label: 'Hierarchy', value: hierarchy, angle: 180 },
  ]

  const toXY = (angle: number, value: number) => {
    const rad = (angle * Math.PI) / 180
    const dist = (value / 100) * r
    return { x: cx + dist * Math.cos(rad), y: cy + dist * Math.sin(rad) }
  }

  // Grid rings
  const rings = [25, 50, 75, 100]

  // Data polygon points
  const points = axes.map((a) => toXY(a.angle, a.value))
  const polygonStr = points.map((p) => `${p.x},${p.y}`).join(' ')

  return (
    <svg viewBox={`0 0 ${totalSize} ${totalSize}`} className="mx-auto w-full max-w-sm">
      {/* Grid rings */}
      {rings.map((ring) => {
        const ringPoints = axes.map((a) => toXY(a.angle, ring))
        return (
          <polygon
            key={ring}
            points={ringPoints.map((p) => `${p.x},${p.y}`).join(' ')}
            fill="none"
            stroke="hsl(225, 30%, 20%)"
            strokeWidth={0.5}
          />
        )
      })}

      {/* Axis lines */}
      {axes.map((a) => {
        const end = toXY(a.angle, 100)
        return (
          <line key={a.label} x1={cx} y1={cy} x2={end.x} y2={end.y} stroke="hsl(225, 30%, 25%)" strokeWidth={0.5} />
        )
      })}

      {/* Data polygon */}
      <polygon points={polygonStr} fill="hsl(38, 92%, 50%)" fillOpacity={0.2} stroke="hsl(38, 92%, 50%)" strokeWidth={2} />

      {/* Data points */}
      {points.map((p, i) => (
        <circle key={axes[i]!.label} cx={p.x} cy={p.y} r={4} fill="hsl(38, 92%, 50%)" />
      ))}

      {/* Labels */}
      {axes.map((a) => {
        const labelPos = toXY(a.angle, 115)
        return (
          <text
            key={a.label}
            x={labelPos.x}
            y={labelPos.y}
            textAnchor="middle"
            dominantBaseline="central"
            fill="hsl(220, 14%, 55%)"
            fontSize={10}
            fontFamily="Inter Variable, sans-serif"
          >
            {a.label} ({a.value})
          </text>
        )
      })}
    </svg>
  )
}

export default CvfRadarChart
