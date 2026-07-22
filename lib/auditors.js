import { slugify } from './roster'

// Auditors have no technicians assigned to them (unlike LEADERS in
// lib/roster.js) — they only submit findings, tied back to themselves as
// the reporter. Same slugify() as leaders so routing stays consistent.
export const AUDITORS = [{ name: 'Francesco Cimmarrusti', color: 'slate' }]

export function auditorSlug(name) {
  return slugify(name)
}

export function getAuditorBySlug(slug) {
  return AUDITORS.find((a) => slugify(a.name) === slug) ?? null
}
