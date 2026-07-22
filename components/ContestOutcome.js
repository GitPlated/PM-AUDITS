// Shows what happened to a resolved contest: which findings were dismissed
// (not at fault) with the corrective action taken, and which were confirmed
// (still need discipline) with why the justification didn't hold up.
export function ContestOutcome({ contest, findingsById }) {
  const dismissedSet = new Set(contest.dismissed_finding_ids || [])
  const dismissedFindings = contest.finding_ids
    .filter((id) => dismissedSet.has(id))
    .map((id) => findingsById.get(id))
    .filter(Boolean)
  const confirmedFindings = contest.finding_ids
    .filter((id) => !dismissedSet.has(id))
    .map((id) => findingsById.get(id))
    .filter(Boolean)

  return (
    <>
      {dismissedFindings.length > 0 && (
        <div className="notice-panel" style={{ marginTop: 0 }}>
          <span className="mark">✓</span>
          <div>
            <h3>Dismissed — not at fault</h3>
            <ul className="outcome-finding-list">
              {dismissedFindings.map((f) => (
                <li key={f.id}>
                  {f.pm_task} <span className="field-note">({f.occurrence_date})</span>
                </li>
              ))}
            </ul>
            {contest.corrective_action_notes && (
              <p className="timeline-detail">
                <strong>Corrective action:</strong> {contest.corrective_action_notes}
              </p>
            )}
          </div>
        </div>
      )}

      {confirmedFindings.length > 0 && (
        <div className="notice-panel notice-alert" style={{ marginTop: dismissedFindings.length > 0 ? '0.75rem' : 0 }}>
          <span className="mark">!</span>
          <div>
            <h3>Denied — disciplinary action still required</h3>
            <ul className="outcome-finding-list">
              {confirmedFindings.map((f) => (
                <li key={f.id}>
                  {f.pm_task} <span className="field-note">({f.occurrence_date})</span>
                </li>
              ))}
            </ul>
            {contest.rejection_notes && (
              <p className="timeline-detail">
                <strong>Why:</strong> {contest.rejection_notes}
              </p>
            )}
          </div>
        </div>
      )}

      <p className="field-note" style={{ marginTop: '0.6rem' }}>
        Resolved {contest.resolved_at ? contest.resolved_at.slice(0, 10) : ''} by{' '}
        {contest.resolved_by || 'Admin'}
      </p>
    </>
  )
}
