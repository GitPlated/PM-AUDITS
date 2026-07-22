import { supabase } from './supabaseClient'
import { computeFindingStatuses } from './contests'

export async function loadComplianceData() {
  if (!supabase) return { findings: [], actions: [], contests: [], connected: false }

  const [findingsRes, actionsRes, contestsRes] = await Promise.all([
    supabase.from('pm_findings').select('*').order('occurrence_date', { ascending: false }),
    supabase.from('discipline_actions').select('*').order('action_date', { ascending: false }),
    supabase.from('finding_contests').select('*').order('created_at', { ascending: false }),
  ])

  if (findingsRes.error) console.error(findingsRes.error)
  if (actionsRes.error) console.error(actionsRes.error)
  if (contestsRes.error) console.error(contestsRes.error)

  return {
    findings: findingsRes.data ?? [],
    actions: actionsRes.data ?? [],
    contests: contestsRes.data ?? [],
    connected: true,
  }
}

// Legacy helper: findings with no discipline action yet, regardless of
// contest status. Prefer openFindingsForAction where contests matter.
export function unactionedFindings(findings, actions) {
  const actionedIds = new Set()
  for (const a of actions) {
    if (a.finding_id) actionedIds.add(a.finding_id)
    if (Array.isArray(a.finding_ids)) {
      for (const id of a.finding_ids) actionedIds.add(id)
    }
  }
  return findings.filter((f) => !actionedIds.has(f.id))
}

// Findings actually actionable right now: not yet actioned, not dismissed by
// a resolved contest, and not on hold from a pending one.
export function openFindingsForAction(findings, actions, contests, techShiftMap) {
  const statusById = computeFindingStatuses(findings, actions, contests, techShiftMap)
  return findings.filter((f) => statusById.get(f.id) === 'open')
}

// Findings on hold pending contest review (informational, not actionable).
export function onHoldFindings(findings, actions, contests, techShiftMap) {
  const statusById = computeFindingStatuses(findings, actions, contests, techShiftMap)
  return findings.filter((f) => statusById.get(f.id) === 'on_hold')
}
