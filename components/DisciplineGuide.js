import { DISCIPLINE_STEPS, VIOLATION_TABLE, WORDING_GUIDE_URL } from '../lib/compliance'
import { StepIcon } from './StepIcon'

export function DisciplineGuide() {
  return (
    <>
      <section className="panel guide-wording">
        <StepIcon step="wording" className="guide-wording-icon" />
        <div>
          <h2>How to word the conversation</h2>
          <p className="panel-sub">Guidance on how to phrase these conversations with a technician, before you start:</p>
          <a className="btn btn-sm" href={WORDING_GUIDE_URL} target="_blank" rel="noreferrer">
            Open conversation wording guide ↗
          </a>
        </div>
      </section>

      <div className="step-flow">
        {DISCIPLINE_STEPS.map((step, i) => (
          <div className="step-flow-item" key={step.key}>
            <div className={`step-flow-card step-flow-${step.key}`}>
              <StepIcon step={step.key} className="step-flow-icon" />
              <div className="step-flow-number mono">Step {step.number}</div>
              <h3>{step.label}</h3>
              <p>{step.instructions}</p>
              {step.expiresAfterMonths && (
                <p className="step-expiry">Expires after {step.expiresAfterMonths} months</p>
              )}
              <a className="btn btn-sm" href={step.formUrl} target="_blank" rel="noreferrer">
                Open {step.formLabel} ↗
              </a>
            </div>
            {i < DISCIPLINE_STEPS.length - 1 && (
              <div className="step-flow-arrow" aria-hidden="true">
                →
              </div>
            )}
          </div>
        ))}
      </div>

      <section className="panel">
        <h2>Skipping steps for egregious violations</h2>
        <p className="panel-sub">
          Safety or workplace-policy violations serious enough can skip levels of the ladder above. Use the
          table below (from the handbook) to decide the correct starting step.
        </p>
        <div className="table-scroll">
          <table className="ref-table">
            <thead>
              <tr>
                <th>Behavior Violation Type</th>
                {VIOLATION_TABLE.columns.map((col) => (
                  <th key={col}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {VIOLATION_TABLE.rows.map((row) => (
                <tr key={row.type}>
                  <th scope="row">{row.type}</th>
                  {row.cells.map((cell, i) => (
                    <td key={i} className={cell ? '' : 'na'}>
                      {cell ?? ''}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="table-footnote">
          Blank cells mean that step is skipped for that violation type — e.g. Time Theft goes straight to
          termination on the first occurrence.
        </p>
      </section>
    </>
  )
}
