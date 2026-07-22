import { workWeekStart } from './workweek'

function bundleKeyFor(technicianName, shiftCode, occurrenceDate) {
  return `${technicianName}__${workWeekStart(shiftCode, occurrenceDate)}`
}

// One status per finding: 'actioned' (a discipline action covers it),
// 'dismissed' (a resolved contest cleared it — tech wasn't at fault),
// 'on_hold' (it shares a work week with a finding under a still-pending
// contest, so no discipline can be logged for it yet), or 'open' (normal,
// actionable). Contesting one finding holds its *entire* work-week bundle,
// not just the finding(s) the leader picked.
export function computeFindingStatuses(findings, actions, contests, techShiftMap) {
  const actionedIds = new Set()
  actions.forEach((a) => {
    if (a.finding_id) actionedIds.add(a.finding_id)
    if (Array.isArray(a.finding_ids)) a.finding_ids.forEach((id) => actionedIds.add(id))
  })

  const dismissedIds = new Set()
  contests
    .filter((c) => c.status === 'resolved')
    .forEach((c) => (c.dismissed_finding_ids || []).forEach((id) => dismissedIds.add(id)))

  const findingById = new Map(findings.map((f) => [f.id, f]))
  const heldBundleKeys = new Set()
  contests
    .filter((c) => c.status === 'pending')
    .forEach((c) => {
      c.finding_ids.forEach((id) => {
        const f = findingById.get(id)
        if (f) heldBundleKeys.add(bundleKeyFor(f.technician_name, techShiftMap.get(f.technician_name), f.occurrence_date))
      })
    })

  const statusById = new Map()
  for (const f of findings) {
    if (actionedIds.has(f.id)) {
      statusById.set(f.id, 'actioned')
    } else if (dismissedIds.has(f.id)) {
      statusById.set(f.id, 'dismissed')
    } else if (heldBundleKeys.has(bundleKeyFor(f.technician_name, techShiftMap.get(f.technician_name), f.occurrence_date))) {
      statusById.set(f.id, 'on_hold')
    } else {
      statusById.set(f.id, 'open')
    }
  }
  return statusById
}

export function pendingContestsCount(contests) {
  return contests.filter((c) => c.status === 'pending').length
}
