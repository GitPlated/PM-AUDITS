'use client'

import { useRef, useState, useTransition } from 'react'
import { logAction } from '../lib/actions'
import { DISCIPLINE_STEPS, MIN_ACTION_NOTES_WORDS as MIN_NOTES_WORDS } from '../lib/compliance'

function countWords(text) {
  return text.trim().split(/\s+/).filter(Boolean).length
}

export function ActionForm({ technicianName, findingId, leaderName, onDone }) {
  const formRef = useRef(null)
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState(null)
  const [step, setStep] = useState('')
  const [notes, setNotes] = useState('')

  const stepMeta = DISCIPLINE_STEPS.find((s) => s.key === step)
  const isCoaching = step === 'coaching'
  const fieldsEnabled = Boolean(step)
  const notesWordCount = countWords(notes)
  const notesTooShort = notesWordCount < MIN_NOTES_WORDS

  function handleSubmit(e) {
    e.preventDefault()
    if (notesTooShort) {
      setMessage({
        type: 'error',
        text: `Notes need at least ${MIN_NOTES_WORDS} words (currently ${notesWordCount}).`,
      })
      return
    }
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await logAction(formData)
      if (result?.error) {
        setMessage({ type: 'error', text: result.error })
      } else {
        setMessage({ type: 'success', text: 'Action logged.' })
        formRef.current?.reset()
        setStep('')
        setNotes('')
        onDone?.()
      }
    })
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="compliance-form">
      <input type="hidden" name="technician_name" value={technicianName} />
      {findingId && <input type="hidden" name="finding_id" value={findingId} />}
      <input type="hidden" name="created_by" value={leaderName ?? ''} />

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

        <div className="signature-field">
          <span className="signature-label">Signed by</span>
          <span className="signature-name">{leaderName || '—'}</span>
        </div>

        {stepMeta && (
          <div className="doc-required-panel span-2">
            <p className="doc-required-note doc-required-lead">
              <strong>Have the conversation with the technician before filling out anything below.</strong>
            </p>
            {isCoaching ? (
              <>
                <p className="doc-required-note">
                  Print the{' '}
                  <a href={stepMeta.formUrl} target="_blank" rel="noreferrer">
                    {stepMeta.formLabel}
                  </a>{' '}
                  to use during that conversation, then upload a photo of the completed form below.
                </p>
                <label className="doc-upload-label">
                  Photo of completed form
                  <input type="file" name="coaching_photo" accept="image/*" capture="environment" required />
                </label>
              </>
            ) : (
              <p className="doc-required-note">
                Then open the{' '}
                <a href={stepMeta.formUrl} target="_blank" rel="noreferrer">
                  {stepMeta.formLabel}
                </a>
                , fill it out completely, and forward the email confirmation to your manager / senior maintenance
                manager.
              </p>
            )}
          </div>
        )}

        <label>
          Action date
          <input type="date" name="action_date" required disabled={!fieldsEnabled} />
        </label>

        <label className="span-2">
          Skipped a step? Why
          <input
            type="text"
            name="skip_reason"
            placeholder="Leave blank if following the normal progression"
            disabled={!fieldsEnabled}
          />
        </label>

        <label className="span-2">
          Notes <span className="field-note">(at least {MIN_NOTES_WORDS} words)</span>
          <textarea
            name="notes"
            rows={3}
            required
            disabled={!fieldsEnabled}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          {fieldsEnabled && (
            <span className={`word-count${notesTooShort ? ' word-count-low' : ''}`}>
              {notesWordCount} / {MIN_NOTES_WORDS} words
            </span>
          )}
        </label>
      </div>

      {message && <p className={`form-message ${message.type}`}>{message.text}</p>}

      <button type="submit" className="btn" disabled={pending || !fieldsEnabled}>
        {pending ? 'Saving…' : 'Log action'}
      </button>
    </form>
  )
}
