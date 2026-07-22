'use client'

import { useRef, useState, useTransition } from 'react'
import { raiseContest } from '../lib/actions'

export function ContestForm({ technicianName, findings, leaderName, onDone }) {
  const formRef = useRef(null)
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState(null)
  const [selected, setSelected] = useState(() => new Set())

  function toggle(id) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (selected.size === 0) {
      setMessage({ type: 'error', text: 'Select at least one finding to contest.' })
      return
    }
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await raiseContest(formData)
      if (result?.error) {
        setMessage({ type: 'error', text: result.error })
      } else {
        setMessage({
          type: 'success',
          text: 'Submitted for review. This work week is on hold for discipline until Admin or the auditor reviews it.',
        })
        formRef.current?.reset()
        setSelected(new Set())
        onDone?.()
      }
    })
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="compliance-form">
      <input type="hidden" name="technician_name" value={technicianName} />
      <input type="hidden" name="leader_name" value={leaderName ?? ''} />

      <div className="form-grid">
        <div className="span-2">
          <p className="field-note" style={{ marginBottom: '0.5rem' }}>
            Which finding{findings.length === 1 ? '' : 's'} is the technician not at fault for?
          </p>
          <div className="contest-finding-list">
            {findings.map((f) => (
              <label className="checkbox-label" key={f.id}>
                <input
                  type="checkbox"
                  name="finding_ids"
                  value={f.id}
                  checked={selected.has(f.id)}
                  onChange={() => toggle(f.id)}
                />
                <span>
                  {f.pm_task} <span className="field-note">({f.occurrence_date})</span>
                </span>
              </label>
            ))}
          </div>
        </div>

        <label className="span-2">
          Why was the technician justified?
          <textarea
            name="justification"
            rows={3}
            required
            placeholder='e.g. "Work instructions were not clear"'
          />
        </label>
      </div>

      {message && <p className={`form-message ${message.type}`}>{message.text}</p>}

      <button type="submit" className="btn" disabled={pending}>
        {pending ? 'Submitting…' : 'Submit for review'}
      </button>
    </form>
  )
}
