'use server'

import { revalidatePath } from 'next/cache'
import { supabase } from './supabaseClient'
import { computeExpiry, getLeaderForTechnician } from './compliance'

const NOT_CONFIGURED = 'Supabase is not connected yet — see .env.example / README before this can save.'

export async function logFinding(formData) {
  if (!supabase) return { error: NOT_CONFIGURED }

  const technician_name = formData.get('technician_name')
  if (!technician_name) return { error: 'Pick a technician.' }

  const payload = {
    technician_name,
    leader_name: getLeaderForTechnician(technician_name) ?? 'Unassigned',
    pm_task: formData.get('pm_task'),
    occurrence_date: formData.get('occurrence_date'),
    occurrence_url: formData.get('occurrence_url') || null,
    reason_given: formData.get('reason_given') || null,
    is_critical_pm: formData.get('is_critical_pm') === 'on',
    reported_by: formData.get('reported_by') || null,
    notes: formData.get('notes') || null,
  }

  const { error } = await supabase.from('pm_findings').insert(payload)
  if (error) return { error: error.message }

  revalidatePath('/', 'layout')
  return { ok: true }
}

export async function logAction(formData) {
  if (!supabase) return { error: NOT_CONFIGURED }

  const technician_name = formData.get('technician_name')
  const step = formData.get('step')
  const action_date = formData.get('action_date')
  if (!technician_name || !step || !action_date) {
    return { error: 'Technician, step, and date are required.' }
  }

  const payload = {
    finding_id: formData.get('finding_id') || null,
    technician_name,
    leader_name: getLeaderForTechnician(technician_name) ?? 'Unassigned',
    step,
    action_date,
    expires_at: computeExpiry(step, action_date),
    skip_reason: formData.get('skip_reason') || null,
    notes: formData.get('notes') || null,
    created_by: formData.get('created_by') || null,
  }

  const { error } = await supabase.from('discipline_actions').insert(payload)
  if (error) return { error: error.message }

  revalidatePath('/', 'layout')
  return { ok: true }
}
