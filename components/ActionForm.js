'use client'

import { useRef, useState, useTransition } from 'react'
import { logAction } from '../lib/actions'
import { DISCIPLINE_STEPS } from '../lib/compliance'

export function ActionForm({ technicianName, findingId, onDone }) {
  const formRef = useRef(null)
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState(null)
  const [step, setStep] = useState('')

  const stepMeta = DISCIPLINE_STEPS.find((s) => s.key === step)

  function handleSubmit(e) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await logAction(formData)
      if (result?.error) {
        setMessage({ type: 'error', text: result.error })
      } else {
        setMessage({ type: 'success', text: 'Action logged.' })
        formRef.current?.reset()
        setStep('')
        onDone?.()
      }
    })
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="compliance-form">
      <input type="hidden" name="technician_name" value={technicianName} />
      {findingId && <input type="hidden" name="finding_id" value={findingId} />}

      <div className="form-grid">
        <label>
          Step
          <select name="step" required value={step} onChange={(e) => setStep(e.target.value)}>
            <option value="" disabled>
              Select…
            </option>
            {DISCIPLINE_STEPS.map((s) => (
              <option key={s.key} value={s.key}>
                {s.number}. {s.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          Action date
          <input type="date" name="action_date" required />
        </label>

        <label className="span-2">
          Skipped a step? Why
          <input type="text" name="skip_reason" placeholder="Leave blank if following the normal progression" />
        </label>

        <label className="span-2">
          Notes
          <textarea name="notes" rows={2} />
        </label>

        <label>
          Logged by
          <input type="text" name="created_by" placeholder="Your name" />
        </label>
      </div>

      {stepMeta && (
        <p className="form-hint">
          Complete this through the{' '}
          <a href={stepMeta.formUrl} target="_blank" rel="noreferrer">
            {stepMeta.formLabel}
          </a>
          . {stepMeta.instructions}
        </p>
      )}

      {message && <p className={`form-message ${message.type}`}>{message.text}</p>}

      <button type="submit" className="btn" disabled={pending}>
        {pending ? 'Saving…' : 'Log action'}
      </button>
    </form>
  )
}
