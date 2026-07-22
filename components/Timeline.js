import { stepInfo } from '../lib/compliance'

export function Timeline({ findings, actions }) {
  const entries = [
    ...findings.map((f) => ({ kind: 'finding', date: f.occurrence_date, data: f })),
    ...actions.map((a) => ({ kind: 'action', date: a.action_date, data: a })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date))

  if (entries.length === 0) {
    return <p className="empty-note">No findings or discipline actions on file yet.</p>
  }

  return (
    <ul className="timeline">
      {entries.map((entry) => {
        if (entry.kind === 'finding') {
          const f = entry.data
          return (
            <li key={`f-${f.id}`} className="timeline-item timeline-finding">
              <div className="timeline-head">
                <span className="timeline-kind">
                  {f.finding_type === 'reactive_wo' ? 'Reactive WO finding' : 'PM finding'}
                  {f.is_critical_pm ? ' · critical PM' : ''}
                </span>
                <span className="timeline-date mono">{f.occurrence_date}</span>
              </div>
              <p className="timeline-title">{f.pm_task}</p>
              {f.reason_given && <p className="timeline-detail">&ldquo;{f.reason_given}&rdquo;</p>}
              <div className="timeline-meta">
                {f.occurrence_url && (
                  <a href={f.occurrence_url} target="_blank" rel="noreferrer">
                    FMX occurrence ↗
                  </a>
                )}
                {f.reported_by && <span>Reported by {f.reported_by}</span>}
              </div>
            </li>
          )
        }
        const a = entry.data
        const info = stepInfo(a.step)
        return (
          <li key={`a-${a.id}`} className="timeline-item timeline-action">
            <div className="timeline-head">
              <span className="timeline-kind">
                Step {info?.number} · {info?.label}
              </span>
              <span className="timeline-date mono">{a.action_date}</span>
            </div>
            {a.skip_reason && <p className="timeline-detail">Skipped to this step: {a.skip_reason}</p>}
            {a.notes && <p className="timeline-detail">{a.notes}</p>}
            <div className="timeline-meta">
              {a.expires_at && <span>Active until {a.expires_at}</span>}
              {a.created_by && <span>Logged by {a.created_by}</span>}
            </div>
          </li>
        )
      })}
    </ul>
  )
}
