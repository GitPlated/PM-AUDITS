const MS_PER_DAY = 86400000

// Front Half (FHD/FHS/FHN) works Saturday through Wednesday.
// Back Half (BHD/BHS/BHN) works Wednesday through Sunday.
// Wednesday is the shared changeover day between the two crews.
export function shiftGroupFor(shiftCode) {
  if (!shiftCode) return null
  if (shiftCode.startsWith('F')) return 'front'
  if (shiftCode.startsWith('B')) return 'back'
  return null
}

// The date (YYYY-MM-DD) this technician's work week started, given any date
// that falls within it. Two findings on the same technician with the same
// workWeekStart happened in the same work week and should be one conversation.
export function workWeekStart(shiftCode, dateStr) {
  const group = shiftGroupFor(shiftCode)
  if (!group || !dateStr) return dateStr ?? null
  const anchorDay = group === 'front' ? 6 : 3 // Saturday : Wednesday
  const d = new Date(`${dateStr}T00:00:00Z`)
  const offset = (d.getUTCDay() - anchorDay + 7) % 7
  return new Date(d.getTime() - offset * MS_PER_DAY).toISOString().slice(0, 10)
}

// 5-day work week: start + 4 days.
export function workWeekEnd(shiftCode, weekStartStr) {
  if (!weekStartStr) return null
  const d = new Date(`${weekStartStr}T00:00:00Z`)
  return new Date(d.getTime() + 4 * MS_PER_DAY).toISOString().slice(0, 10)
}

export function formatWeekRange(shiftCode, weekStartStr) {
  if (!weekStartStr) return ''
  const group = shiftGroupFor(shiftCode)
  const end = workWeekEnd(shiftCode, weekStartStr)
  const fmt = (s) =>
    new Date(`${s}T00:00:00Z`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })
  const label = group === 'front' ? 'Front Half' : group === 'back' ? 'Back Half' : 'Work'
  return end ? `${label} week: ${fmt(weekStartStr)}–${fmt(end)}` : fmt(weekStartStr)
}
