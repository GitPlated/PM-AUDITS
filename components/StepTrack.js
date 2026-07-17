import { stepInfo } from '../lib/compliance'

// Discipline actions for one technician, oldest first, left to right —
// so the order they happened in reads the same way you'd read a sentence.
export function StepTrack({ actions }) {
  const sorted = [...actions].sort((a, b) => new Date(a.action_date) - new Date(b.action_date))
  if (sorted.length === 0) return null

  return (
    <div className="step-track">
      {sorted.map((action, i) => {
        const info = stepInfo(action.step)
        return (
          <div className="step-track-item" key={action.id}>
            {i > 0 && <span className="step-track-connector" aria-hidden="true" />}
            <div className={`step-track-node step-track-${action.step}`}>
              <span className="mono">{info?.number}</span>
            </div>
            <div className="step-track-label">
              <span className="step-track-name">{info?.short}</span>
              <span className="step-track-date mono">{action.action_date}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
