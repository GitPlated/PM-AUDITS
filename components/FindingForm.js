'use client'

import { useRef, useState, useTransition } from 'react'
import { logFinding } from '../lib/actions'

export function FindingForm({ technicians, defaultTechnician, leaderName, findingType = 'pm' }) {
  const formRef = useRef(null)
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState(null)
  const isReactive = findingType === 'reactive_wo'

  function handleSubmit(e) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await logFinding(formData)
      if (result?.error) {
        setMessage({ type: 'error', text: result.error })
      } else {
        setMessage({ type: 'success', text: 'Finding logged.' })
        formRef.current?.reset()
      }
    })
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="compliance-form">
      <input type="hidden" name="finding_type" value={findingType} />
      <div className="form-grid">
        <label>
          Technician
          <select name="technician_name" required defaultValue={defaultTechnician ?? ''}>
            <option value="" disabled>
              Select…
            </option>
            {technicians.map((t) => (
              <option key={t.name} value={t.name}>
                {t.name} — {t.leaderName}
              </option>
            ))}
          </select>
        </label>

        <label>
          Occurrence date
          <input type="date" name="occurrence_date" required />
        </label>

        <label className="span-2">
          {isReactive ? 'Reactive WO task' : 'PM task'}
          <input
            type="text"
            name="pm_task"
            placeholder={
              isReactive
                ? 'e.g. "Reactive WO #12345 — Conveyor belt repair"'
                : 'e.g. "Daily PM — Conveyor #3, occurrence 496858"'
            }
            required
          />
        </label>

        <label className="span-2">
          FMX {isReactive ? 'work order' : 'occurrence'} link
          <input type="url" name="occurrence_url" placeholder="https://hellofresh.gofmx.com/planned-maintenance/tasks/…" />
        </label>

        <label className="span-2">
          What did the technician do incorrectly
          <textarea
            name="reason_given"
            rows={2}
            placeholder={
              isReactive
                ? 'e.g. "Left the work order incomplete without noting why."'
                : 'e.g. "Not able to execute PM due to machine being in use all day."'
            }
          />
        </label>

        {leaderName ? (
          <div className="signature-field">
            <span className="signature-label">Reported by</span>
            <span className="signature-name">{leaderName}</span>
            <input type="hidden" name="reported_by" value={leaderName} />
          </div>
        ) : (
          <label>
            Reported by
            <input type="text" name="reported_by" placeholder="Your name" />
          </label>
        )}

        <label className="span-2">
          Notes
          <textarea name="notes" rows={2} />
        </label>
      </div>

      {message && <p className={`form-message ${message.type}`}>{message.text}</p>}

      <button type="submit" className="btn" disabled={pending}>
        {pending ? 'Saving…' : isReactive ? 'Log reactive WO finding' : 'Log PM finding'}
      </button>
    </form>
  )
}
