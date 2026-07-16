import { isActionExpired, stepInfo } from '../lib/compliance'

export function StatusPill({ action }) {
  if (!action) return <span className="pill pill-none">No active discipline</span>

  if (action.step === 'termination') {
    return <span className="pill pill-terminated">Terminated {action.action_date}</span>
  }

  const info = stepInfo(action.step)
  const expired = isActionExpired(action)

  if (expired) {
    return (
      <span className="pill pill-expired">
        {info?.short} expired {action.expires_at}
      </span>
    )
  }

  if (action.step === 'coaching') {
    return <span className="pill pill-coaching">Coached {action.action_date}</span>
  }

  return (
    <span className={`pill pill-${action.step === 'final_written_warning' ? 'final' : 'warning'}`}>
      {info?.short} · active until {action.expires_at}
    </span>
  )
}
