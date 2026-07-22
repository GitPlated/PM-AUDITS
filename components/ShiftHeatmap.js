import { SHIFT_ORDER } from '../lib/compliance'

// Fixed heat color independent of the site's light/dark accent tokens —
// a heatmap's color scale is meant to read as "heat," not theme with the page.
function heatStyle(count, max) {
  if (max === 0) return {}
  const ratio = count / max
  const alpha = count === 0 ? 0.05 : 0.14 + ratio * 0.66
  return {
    backgroundColor: `rgba(163, 63, 38, ${alpha})`,
    color: ratio > 0.45 ? '#ffffff' : 'var(--ink)',
    borderColor: ratio > 0.45 ? 'transparent' : 'var(--border)',
  }
}

export function ShiftHeatmap({ findings, techShiftMap }) {
  const counts = SHIFT_ORDER.map((s) => ({
    ...s,
    count: findings.filter((f) => techShiftMap.get(f.technician_name) === s.code).length,
  }))
  const max = Math.max(0, ...counts.map((s) => s.count))

  return (
    <div className="shift-heatmap">
      {counts.map((s) => (
        <div className="heat-tile" key={s.code} style={heatStyle(s.count, max)}>
          <div className="heat-tile-code mono">{s.code}</div>
          <div className="heat-tile-count mono">{s.count}</div>
          <div className="heat-tile-label">{s.label}</div>
        </div>
      ))}
    </div>
  )
}
