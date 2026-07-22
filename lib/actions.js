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
