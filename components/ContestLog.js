'use client'

import { useState, useTransition } from 'react'
import { markContestViewed } from '../lib/actions'
import { ContestOutcome } from './ContestOutcome'

function ContestLogItem({ contest, findingsById }) {
  const [open, setOpen] = useState(false)
  const [viewed, setViewed] = useState(Boolean(contest.viewed_at))
  const [, startTransition] = useTransition()

  function handleToggle() {
    setOpen((v) => !v)
    if (!viewed) {
      setViewed(true)
      const formData = new FormData()
      formData.set('contest_id', contest.id)
      startTransition(() => {
        markContestViewed(formData)
      })
    }
  }

  return (
    <li className="queue-item">
      <button type="button" className="queue-item-summary" onClick={handleToggle}>
        {!viewed && <span className="pill pill-critical">New</span>}
        <span className="queue-item-name">{contest.technician_name}</span>
        <span className="queue-item-task">
          {contest.finding_ids.length} finding{contest.finding_ids.length === 1 ? '' : 's'} reviewed
        </span>
        <span className="tech-row-caret">{open ? '−' : '+'}</span>
      </button>
      {open && (
        <div className="tech-row-detail">
          <ContestOutcome contest={contest} findingsById={findingsById} />
        </div>
      )}
    </li>
  )
}

export function ContestLog({ contests, findings }) {
  const findingsById = new Map(findings.map((f) => [f.id, f]))
  const resolved = contests
    .filter((c) => c.status === 'resolved')
    .sort((a, b) => new Date(b.resolved_at) - new Date(a.resolved_at))

  if (resolved.length === 0) return null

  return (
    <ul className="queue">
      {resolved.map((c) => (
        <ContestLogItem key={c.id} contest={c} findingsById={findingsById} />
      ))}
    </ul>
  )
}
