'use client'

import { useState } from 'react'
import { currentStepFor } from '../lib/compliance'
import { StatusPill } from './StatusPill'
import { StepTrack } from './StepTrack'
import { Timeline } from './Timeline'
import { ActionForm } from './ActionForm'

function QueueItem({ finding, leaderName }) {
  const [open, setOpen] = useState(false)
  return (
    <li className="queue-item">
      <button type="button" className="queue-item-summary" onClick={() => setOpen((v) => !v)}>
        <span className="queue-item-name">{finding.technician_name}</span>
        <span className="queue-item-task">{finding.pm_task}</span>
        {finding.is_critical_pm && <span className="pill pill-critical">Critical PM</span>}
        <span className="queue-item-date mono">{finding.occurrence_date}</span>
        <span className="tech-row-caret">{open ? '−' : '+'}</span>
      </button>
      {open && (
        <div className="tech-row-detail">
          {finding.reason_given && <p className="timeline-detail">&ldquo;{finding.reason_given}&rdquo;</p>}
          {finding.occurrence_url && (
            <p className="timeline-meta">
              <a href={finding.occurrence_url} target="_blank" rel="noreferrer">
                FMX occurrence ↗
              </a>
            </p>
          )}
          <details className="log-action">
            <summary>Log disciplinary action for {finding.technician_name}</summary>
            <ActionForm technicianName={finding.technician_name} findingId={finding.id} leaderName={leaderName} />
          </details>
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

export function TeamSection({ leader, findings, actions }) {
  const actionedIds = new Set(actions.map((a) => a.finding_id).filter(Boolean))
  const openFindings = findings.filter((f) => !actionedIds.has(f.id))

  const hasOpen = openFindings.length > 0

  return (
    <>
      <div className={`subsection needs-action${hasOpen ? ' needs-action-alert' : ''}`}>
        <h4>
          Needs action <span className="count-badge mono">{openFindings.length}</span>
        </h4>
        {!hasOpen ? (
          <p className="empty-note">Nothing outstanding for this team.</p>
        ) : (
          <ul className="queue">
            {openFindings.map((f) => (
              <QueueItem key={f.id} finding={f} leaderName={leader.name} />
            ))}
          </ul>
        )}
      </div>

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
