'use client'

import { useState } from 'react'
import { currentStepFor } from '../lib/compliance'
import { formatWeekRange, groupFindingsByWorkWeek } from '../lib/workweek'
import { computeFindingStatuses } from '../lib/contests'
import { StatusPill } from './StatusPill'
import { StepTrack } from './StepTrack'
import { Timeline } from './Timeline'
import { ActionForm } from './ActionForm'
import { ContestForm } from './ContestForm'

function FindingList({ findings }) {
  return (
    <ul className="timeline">
      {findings.map((f) => (
        <li key={f.id} className="timeline-item timeline-finding">
          <div className="timeline-head">
            <span className="timeline-kind">
              {f.finding_type === 'reactive_wo' ? 'Reactive WO finding' : 'PM finding'}
              {f.is_critical_pm ? ' · critical PM' : ''}
            </span>
            <span className="timeline-date mono">{f.occurrence_date}</span>
          </div>
          <p className="timeline-title">{f.pm_task}</p>
          {f.reason_given && <p className="timeline-detail">&ldquo;{f.reason_given}&rdquo;</p>}
          {f.reported_by && (
            <p className="timeline-detail timeline-reporter">
              Reported by <strong>{f.reported_by}</strong> — reach out to them if you have questions about this
              miss.
            </p>
          )}
          {f.occurrence_url && (
            <div className="timeline-meta">
              <a href={f.occurrence_url} target="_blank" rel="noreferrer">
                FMX occurrence ↗
              </a>
            </div>
          )}
        </li>
      ))}
    </ul>
  )
}

// All findings for one technician that fall in the same work week are one
// conversation, not one action per finding — see lib/workweek.js.
function FindingBundle({ bundle, leaderName }) {
  const [open, setOpen] = useState(false)
  const { technicianName, shiftCode, weekStart, findings } = bundle
  const hasCritical = findings.some((f) => f.is_critical_pm)
  const findingIds = findings.map((f) => f.id)

  return (
    <li className="queue-item">
      <button type="button" className="queue-item-summary" onClick={() => setOpen((v) => !v)}>
        <span className="queue-item-name">{technicianName}</span>
        <span className="queue-item-task">
          {findings.length} finding{findings.length === 1 ? '' : 's'} · {formatWeekRange(shiftCode, weekStart)}
        </span>
        {hasCritical && <span className="pill pill-critical">Critical PM</span>}
        <span className="tech-row-caret">{open ? '−' : '+'}</span>
      </button>
      {open && (
        <div className="tech-row-detail">
          <FindingList findings={findings} />

          <details className="log-action">
            <summary>Tech not at fault for one or more findings</summary>
            <ContestForm technicianName={technicianName} findings={findings} leaderName={leaderName} />
          </details>

          <details className="log-action">
            <summary>
              Log one disciplinary action for {technicianName} ({findings.length} finding
              {findings.length === 1 ? '' : 's'})
            </summary>
            <ActionForm technicianName={technicianName} findingIds={findingIds} leaderName={leaderName} />
          </details>
        </div>
      )}
    </li>
  )
}

// A bundle where one of its findings was contested — the whole work week is
// held from discipline until Admin or the auditor reviews it.
function OnHoldBundle({ bundle, contests }) {
  const [open, setOpen] = useState(false)
  const { technicianName, shiftCode, weekStart, findings } = bundle
  const relevant = contests.filter((c) => c.status === 'pending' && c.technician_name === technicianName)

  return (
    <li className="queue-item">
      <button type="button" className="queue-item-summary" onClick={() => setOpen((v) => !v)}>
        <span className="queue-item-name">{technicianName}</span>
        <span className="queue-item-task">
          {findings.length} finding{findings.length === 1 ? '' : 's'} · {formatWeekRange(shiftCode, weekStart)}
        </span>
        <span className="pill pill-coaching">Pending review</span>
        <span className="tech-row-caret">{open ? '−' : '+'}</span>
      </button>
      {open && (
        <div className="tech-row-detail">
          <div className="notice-panel" style={{ marginTop: 0 }}>
            <span className="mark">i</span>
            <div>
              <h3>On hold pending review</h3>
              <p>
                Flagged as not at fault for one or more findings this work week. No disciplinary action can be
                logged until Admin or the auditor reviews it — you&rsquo;ll see this move back to Needs Action if
                any findings are confirmed.
              </p>
            </div>
          </div>
          {relevant.map((c) => (
            <p className="timeline-detail" key={c.id}>
              <strong>{c.leader_name}</strong>: &ldquo;{c.justification}&rdquo;
            </p>
          ))}
          <FindingList findings={findings} />
        </div>
      )}
    </li>
  )
}

function TechRow({ tech, findings, actions, leaderName }) {
  const [open, setOpen] = useState(false)
  const current = currentStepFor(tech.name, actions)
  const techFindings = findings.filter((f) => f.technician_name === tech.name)
  const techActions = actions.filter((a) => a.technician_name === tech.name)

  return (
    <li className="tech-row">
      <button type="button" className="tech-row-summary" onClick={() => setOpen((v) => !v)}>
        <span className="tech-row-name">
          {tech.name} <span className="tech-row-role">{tech.role}</span>
        </span>
        {techActions.length === 0 ? (
          <span className="empty-note">No discipline actions logged.</span>
        ) : (
          <StepTrack actions={techActions} />
        )}
        <StatusPill action={current} />
        <span className="tech-row-caret">{open ? '−' : '+'}</span>
      </button>
      {open && (
        <div className="tech-row-detail">
          <Timeline findings={techFindings} actions={techActions} />
          <details className="log-action">
            <summary>Log disciplinary action for {tech.name}</summary>
            <ActionForm technicianName={tech.name} leaderName={leaderName} />
          </details>
        </div>
      )}
    </li>
  )
}

export function TeamSection({ leader, findings, actions, contests }) {
  const techShiftMap = new Map()
  leader.shifts.forEach((shift) => {
    shift.techs.forEach((t) => {
      if (!t.vacant) techShiftMap.set(t.name, shift.code)
    })
  })

  const statusById = computeFindingStatuses(findings, actions, contests, techShiftMap)
  const openFindings = findings.filter((f) => statusById.get(f.id) === 'open')
  const onHold = findings.filter((f) => statusById.get(f.id) === 'on_hold')

  const hasOpen = openFindings.length > 0
  const bundles = groupFindingsByWorkWeek(openFindings, techShiftMap)
  const onHoldBundles = groupFindingsByWorkWeek(onHold, techShiftMap)

  return (
    <>
      <div className={`subsection needs-action${hasOpen ? ' needs-action-alert' : ''}`}>
        <h4>
          Needs action <span className="count-badge mono">{bundles.length}</span>
        </h4>
        {!hasOpen ? (
          <p className="empty-note">Nothing outstanding for this team.</p>
        ) : (
          <ul className="queue">
            {bundles.map((bundle) => (
              <FindingBundle key={`${bundle.technicianName}__${bundle.weekStart}`} bundle={bundle} leaderName={leader.name} />
            ))}
          </ul>
        )}
      </div>

      {onHoldBundles.length > 0 && (
        <div className="subsection">
          <h4>
            Pending review <span className="count-badge mono">{onHoldBundles.length}</span>
          </h4>
          <ul className="queue">
            {onHoldBundles.map((bundle) => (
              <OnHoldBundle
                key={`hold-${bundle.technicianName}__${bundle.weekStart}`}
                bundle={bundle}
                contests={contests}
              />
            ))}
          </ul>
        </div>
      )}

      {leader.shifts.map((shift) => (
        <div className="shift-block" key={shift.code}>
          <div className="shift-title">
            {shift.code} — {shift.label} ({shift.techs.filter((t) => !t.vacant).length})
          </div>
          <ul className="tech-list">
            {shift.techs.map((tech, i) =>
              tech.vacant ? (
                <li className="tech-row vacant" key={`vacant-${shift.code}-${i}`}>
                  <div className="tech-row-summary" style={{ cursor: 'default' }}>
                    <span className="tech-row-name" style={{ fontStyle: 'italic', color: 'var(--ink-faint)' }}>
                      Open position
                    </span>
                    <span className="tech-row-role">{tech.role}</span>
                  </div>
                </li>
              ) : (
                <TechRow key={tech.name} tech={tech} findings={findings} actions={actions} leaderName={leader.name} />
              )
            )}
          </ul>
        </div>
      ))}
    </>
  )
}
