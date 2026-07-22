// Resolved contests as a scannable table — one row per contest, not a
// stacking drop-down list. See ContestReview for the pending/active queue.
export function ContestHistoryTable({ contests }) {
  const resolved = contests
    .filter((c) => c.status === 'resolved')
    .sort((a, b) => new Date(b.resolved_at) - new Date(a.resolved_at))

  if (resolved.length === 0) {
    return <p className="empty-note">No contest resolutions yet.</p>
  }

  return (
    <div className="table-scroll">
      <table className="ref-table">
        <thead>
          <tr>
            <th>Technician</th>
            <th>Contested by</th>
            <th>Findings</th>
            <th>Outcome</th>
            <th>Resolved by</th>
            <th>Date</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          {resolved.map((c) => {
            const total = c.finding_ids?.length ?? 0
            const dismissedCount = c.dismissed_finding_ids?.length ?? 0
            const outcome = dismissedCount === 0 ? 'Confirmed' : dismissedCount === total ? 'Dismissed' : 'Mixed'
            const notes = [
              c.corrective_action_notes ? `Corrective action: ${c.corrective_action_notes}` : null,
              c.rejection_notes ? `Rejection: ${c.rejection_notes}` : null,
            ]
              .filter(Boolean)
              .join(' — ')

            return (
              <tr key={c.id}>
                <th scope="row">{c.technician_name}</th>
                <td>{c.leader_name}</td>
                <td className="mono">{total}</td>
                <td>{outcome}</td>
                <td>{c.resolved_by || '—'}</td>
                <td className="mono">{c.resolved_at ? c.resolved_at.slice(0, 10) : '—'}</td>
                <td>{notes || '—'}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
