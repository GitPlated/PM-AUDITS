'use server'

import { revalidatePath } from 'next/cache'
import { supabase } from './supabaseClient'
import { MIN_ACTION_NOTES_WORDS, computeExpiry, getLeaderForTechnician } from './compliance'

const NOT_CONFIGURED = 'Supabase is not connected yet — see .env.example / README before this can save.'

function countWords(text) {
  return text.trim().split(/\s+/).filter(Boolean).length
}

export async function logFinding(formData) {
  if (!supabase) return { error: NOT_CONFIGURED }

  const technician_name = formData.get('technician_name')
  if (!technician_name) return { error: 'Pick a technician.' }

  const payload = {
    technician_name,
    leader_name: getLeaderForTechnician(technician_name) ?? 'Unassigned',
    finding_type: formData.get('finding_type') === 'reactive_wo' ? 'reactive_wo' : 'pm',
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

  const findingIds = formData.getAll('finding_ids').filter(Boolean)

  const notes = formData.get('notes') || ''
  const wordCount = countWords(notes)
  if (wordCount < MIN_ACTION_NOTES_WORDS) {
    return { error: `Notes need at least ${MIN_ACTION_NOTES_WORDS} words (currently ${wordCount}).` }
  }

  let coaching_photo_url = null
  if (step === 'coaching') {
    const photo = formData.get('coaching_photo')
    if (!photo || typeof photo === 'string' || photo.size === 0) {
      return { error: 'Upload a photo of the completed Documented Coaching form.' }
    }
    const safeName = photo.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const path = `${technician_name.replace(/\s+/g, '-')}/${Date.now()}-${safeName}`
    const { error: uploadError } = await supabase.storage
      .from('coaching-forms')
      .upload(path, photo, { contentType: photo.type || 'image/jpeg' })
    if (uploadError) return { error: `Photo upload failed: ${uploadError.message}` }
    coaching_photo_url = supabase.storage.from('coaching-forms').getPublicUrl(path).data.publicUrl
  }

  const payload = {
    finding_id: null,
    finding_ids: findingIds.length > 0 ? findingIds : null,
    technician_name,
    leader_name: getLeaderForTechnician(technician_name) ?? 'Unassigned',
    step,
    action_date,
    expires_at: computeExpiry(step, action_date),
    skip_reason: formData.get('skip_reason') || null,
    notes,
    created_by: formData.get('created_by') || null,
    coaching_photo_url,
  }

  const { error } = await supabase.from('discipline_actions').insert(payload)
  if (error) return { error: error.message }

  revalidatePath('/', 'layout')
  return { ok: true }
}

export async function raiseContest(formData) {
  if (!supabase) return { error: NOT_CONFIGURED }

  const technician_name = formData.get('technician_name')
  const leader_name = formData.get('leader_name')
  const justification = (formData.get('justification') || '').trim()
  const findingIds = formData.getAll('finding_ids').filter(Boolean)

  if (!technician_name) return { error: 'Missing technician.' }
  if (findingIds.length === 0) return { error: 'Select at least one finding to contest.' }
  if (!justification) return { error: 'Explain why the technician was justified.' }

  const { error } = await supabase.from('finding_contests').insert({
    finding_ids: findingIds,
    technician_name,
    leader_name: leader_name || 'Unattributed',
    justification,
    status: 'pending',
  })
  if (error) return { error: error.message }

  revalidatePath('/', 'layout')
  return { ok: true }
}

export async function resolveContest(formData) {
  if (!supabase) return { error: NOT_CONFIGURED }

  const contest_id = formData.get('contest_id')
  const dismissedFindingIds = formData.getAll('dismissed_finding_ids').filter(Boolean)
  const corrective_action_notes = (formData.get('corrective_action_notes') || '').trim()
  const rejection_notes = (formData.get('rejection_notes') || '').trim()

  if (!contest_id) return { error: 'Missing contest.' }

  const { data: contest, error: fetchError } = await supabase
    .from('finding_contests')
    .select('finding_ids')
    .eq('id', contest_id)
    .single()
  if (fetchError) return { error: fetchError.message }

  const someDismissed = dismissedFindingIds.length > 0
  const someRemain = dismissedFindingIds.length < (contest.finding_ids?.length ?? 0)

  if (someDismissed && !corrective_action_notes) {
    return { error: 'Describe the corrective action for the finding(s) you dismissed.' }
  }
  if (someRemain && !rejection_notes) {
    return { error: "Explain why the justification wasn't acceptable for the finding(s) you kept." }
  }

  const { error } = await supabase
    .from('finding_contests')
    .update({
      status: 'resolved',
      dismissed_finding_ids: dismissedFindingIds.length > 0 ? dismissedFindingIds : null,
      corrective_action_notes: corrective_action_notes || null,
      rejection_notes: rejection_notes || null,
      resolved_by: formData.get('resolved_by') || null,
      resolved_at: new Date().toISOString(),
    })
    .eq('id', contest_id)
  if (error) return { error: error.message }

  revalidatePath('/', 'layout')
  return { ok: true }
}

export async function markContestViewed(formData) {
  if (!supabase) return { error: NOT_CONFIGURED }

  const contest_id = formData.get('contest_id')
  if (!contest_id) return { error: 'Missing contest.' }

  const { error } = await supabase
    .from('finding_contests')
    .update({ viewed_at: new Date().toISOString() })
    .eq('id', contest_id)
    .is('viewed_at', null)
  if (error) return { error: error.message }

  revalidatePath('/', 'layout')
  return { ok: true }
}
