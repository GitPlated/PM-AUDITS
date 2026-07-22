'use client'

import { useRef, useState, useTransition } from 'react'
import { resolveContest } from '../lib/actions'

function ResolveForm({ contest, findings, reviewerName, onDone }) {
  const formRef = useRef(null)
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState(null)
  const [dismissed, setDismissed] = useState(() => new Set())

  function toggle(id) {
    setDismissed((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function handleSubmit(e) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await resolveContest(formData)
      if (result?.error) {
        setMessage({ type: 'error', text: result.error })
      } else {
        setMessage({ type: 'success', text: 'Resolved.' })
        formRef.current?.reset()
        onDone?.()
      }
    })
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="compliance-form">
      <input type="hidden" name="contest_id" value={contest.id} />
      <input type="hidden" name="resolved_by" value={reviewerName ?? ''} />

      <div className="form-grid">
        <div className="span-2">
          <p className="field-note" style={{ marginBottom: '0.5rem' }}>
            Check off any finding that&rsquo;s confirmed the technician was <strong>not</strong> at fault for —
            those get dismissed. Leave the rest unchecked to send them back for discipline.
          </p>
          <div className="contest-finding-list">
            {findings.map((f) => (
              <label className="checkbox-label" key={f.id}>
                <input
                  type="checkbox"
                  name="dismissed_finding_ids"
                  value={f.id}
                  checked={dismissed.has(f.id)}
                  onChange={() => toggle(f.id)}
                />
                <span>
                  Dismiss — {f.pm_task} <span className="field-note">({f.occurrence_date})</span>
                </span>
              </label>
            ))}
          </div>
        </div>

        {reviewerName ? (
          <div className="signature-field">
            <span className="signature-label">Resolved by</span>
            <span className="signature-name">{reviewerName}</span>
          </div>
        ) : (
          <label>
            Resolved by
            <input type="text" name="resolved_by" placeholder="Your name" />
          </label>
        )}

        <label className="span-2">
          Resolution notes
          <textarea name="resolution_notes" rows={2} required placeholder="What you found and why." />
        </label>
      </div>

      {message && <p className={`form-message ${message.type}`}>{message.text}</p>}

      <button type="submit" className="btn" disabled={pending}>
        {pending ? 'Saving…' : 'Resolve contest'}
      </button>
    </form>
  )
}

function ContestItem({ contest, findingsById, reviewerName }) {
  const [open, setOpen] = useState(false)
  const findings = contest.finding_ids.map((id) => findingsById.get(id)).filter(Boolean)

  return (
    <li className="queue-item">
      <button type="button" className="queue-item-summary" onClick={() => setOpen((v) => !v)}>
        <span className="queue-item-name">{contest.technician_name}</span>
        <span className="queue-item-task">
          {findings.length} finding{findings.length === 1 ? '' : 's'} contested by {contest.leader_name}
        </span>
        <span className="tech-row-caret">{open ? '−' : '+'}</span>
      </button>
      {open && (
        <div className="tech-row-detail">
          <p className="timeline-detail">&ldquo;{contest.justification}&rdquo;</p>
          <ul className="timeline">
            {findings.map((f) => (
              <li key={f.id} className="timeline-item timeline-finding">
                <div className="timeline-head">
                  <span className="timeline-kind">{f.finding_type === 'reactive_wo' ? 'Reactive WO finding' : 'PM finding'}</span>
                  <span className="timeline-date mono">{f.occurrence_date}</span>
                </div>
                <p className="timeline-title">{f.pm_task}</p>
                {f.reason_given && <p className="timeline-detail">&ldquo;{f.reason_given}&rdquo;</p>}
              </li>
            ))}
          </ul>
          <details className="log-action">
            <summary>Resolve this contest</summary>
            <ResolveForm contest={contest} findings={findings} reviewerName={reviewerName} />
          </details>
        </div>
      )}
    </li>
  )
}

export function ContestReview({ contests, findings, reviewerName }) {
  const pending = contests.filter((c) => c.status === 'pending')
  const findingsById = new Map(findings.map((f) => [f.id, f]))

  if (pending.length === 0) {
    return <p className="empty-note">No contested findings awaiting review.</p>
  }

  return (
    <ul className="queue">
      {pending.map((c) => (
        <ContestItem key={c.id} contest={c} findingsById={findingsById} reviewerName={reviewerName} />
      ))}
    </ul>
  )
}
