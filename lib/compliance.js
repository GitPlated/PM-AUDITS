import { LEADERS } from './roster'

// The four-step ladder leaders are expected to follow, in order.
// expiresAfterMonths is null for steps that don't expire (coaching is a
// permanent record; termination is terminal).
export const DISCIPLINE_STEPS = [
  {
    key: 'coaching',
    number: 1,
    label: 'Documented Coaching',
    short: 'Coaching',
    expiresAfterMonths: null,
    formLabel: 'Documented Coaching form',
    formUrl:
      'https://docs.google.com/document/d/11QyfqJpDV9DT-TgScp-xoXcTjtbbbTfYXV6onKd9ldA/edit?tab=t.0',
    instructions:
      'Talk with the technician about the finding, fill out the Documented Coaching form, and email it to your manager.',
  },
  {
    key: 'written_warning',
    number: 2,
    label: 'Written Warning',
    short: 'Written Warning',
    expiresAfterMonths: 6,
    formLabel: 'Progressive Discipline form',
    formUrl:
      'https://docs.google.com/forms/d/e/1FAIpQLSennQV3vrsSevxX32jls5MUwkOZTNOZhlXrqY-rhnGw6JaDAQ/viewform',
    instructions: 'Submit through the Progressive Discipline form. Stays active for 6 months.',
  },
  {
    key: 'final_written_warning',
    number: 3,
    label: 'Final Written Warning',
    short: 'Final Warning',
    expiresAfterMonths: 6,
    formLabel: 'Progressive Discipline form',
    formUrl:
      'https://docs.google.com/forms/d/e/1FAIpQLSennQV3vrsSevxX32jls5MUwkOZTNOZhlXrqY-rhnGw6JaDAQ/viewform',
    instructions: 'Submit through the Progressive Discipline form. Stays active for 6 months.',
  },
  {
    key: 'termination',
    number: 4,
    label: 'Termination',
    short: 'Termination',
    expiresAfterMonths: null,
    formLabel: 'Progressive Discipline form',
    formUrl:
      'https://docs.google.com/forms/d/e/1FAIpQLSennQV3vrsSevxX32jls5MUwkOZTNOZhlXrqY-rhnGw6JaDAQ/viewform',
    instructions: 'Submit through the Progressive Discipline form.',
  },
]

export const MIN_ACTION_NOTES_WORDS = 10

export const WORDING_GUIDE_URL =
  'https://docs.google.com/document/d/1sWUH4cCGxGCZmjqHmERBlPIejAkUzmukATEm3ASkezI/edit?tab=t.0'

// From the handbook: which occurrence of a given violation type lands on
// which step. A null cell means that step is skipped outright for that
// violation type (e.g. Time Theft jumps straight to termination).
export const VIOLATION_TABLE = {
  columns: ['No Documented Action', 'Written Warning', 'Final Warning', 'Termination'],
  rows: [
    {
      type: 'Missing Punch',
      cells: ['Three (3) occurrences', 'Fourth (4) occurrence', 'Fifth (5) occurrence', 'Sixth (6) occurrence'],
    },
    {
      type: 'Incorrect Shift / Work Day',
      cells: [null, 'First (1) occurrence', 'Second (2) occurrence', 'Third (3) occurrence'],
    },
    {
      type: 'Taking Unauthorized / Extended Breaks',
      cells: [null, 'First (1) occurrence', 'Second (2) occurrence', 'Third (3) occurrence'],
    },
    {
      type: 'Time Theft',
      cells: [null, null, null, 'First (1) occurrence'],
    },
  ],
}

export function stepInfo(key) {
  return DISCIPLINE_STEPS.find((s) => s.key === key) ?? null
}

export function getLeaderForTechnician(name) {
  for (const leader of LEADERS) {
    for (const shift of leader.shifts) {
      if (shift.techs.some((t) => !t.vacant && t.name === name)) {
        return leader.name
      }
    }
  }
  return null
}

export function allTechnicians() {
  const list = []
  for (const leader of LEADERS) {
    for (const shift of leader.shifts) {
      for (const t of shift.techs) {
        if (!t.vacant) list.push({ name: t.name, role: t.role, leaderName: leader.name, shiftCode: shift.code })
      }
    }
  }
  return list.sort((a, b) => a.name.localeCompare(b.name))
}

export function computeExpiry(step, actionDate) {
  const info = stepInfo(step)
  if (!info?.expiresAfterMonths || !actionDate) return null
  const d = new Date(actionDate)
  d.setMonth(d.getMonth() + info.expiresAfterMonths)
  return d.toISOString().slice(0, 10)
}

export function isActionExpired(action, today = new Date()) {
  if (!action.expires_at) return false
  return new Date(action.expires_at) < today
}

// The step that currently governs a technician's standing: termination wins
// outright; otherwise the most recent non-expired warning; otherwise the
// most recent record of any kind (so a fully-expired history still shows
// what happened, just flagged as expired).
export function currentStepFor(technicianName, actions, today = new Date()) {
  const techActions = actions
    .filter((a) => a.technician_name === technicianName)
    .sort((a, b) => new Date(b.action_date) - new Date(a.action_date))
  if (techActions.length === 0) return null

  const termination = techActions.find((a) => a.step === 'termination')
  if (termination) return termination

  const activeWarning = techActions.find(
    (a) =>
      (a.step === 'written_warning' || a.step === 'final_written_warning') &&
      !isActionExpired(a, today)
  )
  if (activeWarning) return activeWarning

  return techActions[0]
}
