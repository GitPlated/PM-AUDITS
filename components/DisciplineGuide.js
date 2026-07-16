import { DISCIPLINE_STEPS, VIOLATION_TABLE, WORDING_GUIDE_URL } from '../lib/compliance'

export function DisciplineGuide() {
  return (
    <>
      <div className="guide-block">
        <h3>The four-step ladder</h3>
        <div className="steps">
          {DISCIPLINE_STEPS.map((step) => (
            <div className="step-card" key={step.key}>
              <div className="step-number mono">{step.number}</div>
              <h4>{step.label}</h4>
              <p>{step.instructions}</p>
              {step.expiresAfterMonths && (
                <p className="step-expiry">Expires after {step.expiresAfterMonths} months</p>
              )}
              <a className="btn btn-sm" href={step.formUrl} target="_blank" rel="noreferrer">
                Open {step.formLabel} ↗
              </a>
            </div>
          ))}
        </div>
      </div>

      <div className="guide-block">
        <h3>Skipping steps for egregious violations</h3>
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
      </div>

      <div className="guide-block">
        <h3>How to word the conversation</h3>
        <p className="panel-sub">Guidance on how to phrase these conversations with a technician, before you start:</p>
        <a className="btn btn-sm" href={WORDING_GUIDE_URL} target="_blank" rel="noreferrer">
          Open conversation wording guide ↗
        </a>
      </div>
    </>
  )
}
