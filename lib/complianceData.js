import { supabase } from './supabaseClient'

export async function loadComplianceData() {
  if (!supabase) return { findings: [], actions: [], connected: false }

  const [findingsRes, actionsRes] = await Promise.all([
    supabase.from('pm_findings').select('*').order('occurrence_date', { ascending: false }),
    supabase.from('discipline_actions').select('*').order('action_date', { ascending: false }),
  ])

  if (findingsRes.error) console.error(findingsRes.error)
  if (actionsRes.error) console.error(actionsRes.error)

  return {
    findings: findingsRes.data ?? [],
    actions: actionsRes.data ?? [],
    connected: true,
  }
}

export function unactionedFindings(findings, actions) {
  const actionedIds = new Set(actions.map((a) => a.finding_id).filter(Boolean))
  return findings.filter((f) => !actionedIds.has(f.id))
}
