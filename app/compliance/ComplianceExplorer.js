'use client'

import { useState } from 'react'
import { currentStepFor, isActionExpired, stepInfo } from '../../lib/compliance'
import { FindingForm } from './FindingForm'
import { ActionForm } from './ActionForm'

function StatusPill({ action }) {
  if (!action) return <span className="pill pill-none">No active discipline</span>

  if (action.step === 'termination') {
    return <span className="pill pill-terminated">Terminated {action.action_date}</span>
  }

  const info = stepInfo(action.step)
  const expired = isActionExpired(action)

  if (expired) {
    return (
      <span className="pill pill-expired">
        {info?.short} expired {action.expires_at}
      </span>
    )
  }

  if (action.step === 'coaching') {
    return <span className="pill pill-coaching">Coached {action.action_date}</span>
  }

  return (
    <span className={`pill pill-${action.step === 'final_written_warning' ? 'final' : 'warning'}`}>
      {info?.short} · active until {action.expires_at}
    </span>
  )
}

function Timeline({ findings, actions }) {
  const entries = [
    ...findings.map((f) => ({ kind: 'finding', date: f.occurrence_date, data: f })),
    ...actions.map((a) => ({ kind: 'action', date: a.action_date, data: a })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date))

  if (entries.length === 0) {
    return <p className="empty-note">No findings or discipline actions on file yet.</p>
  }

  return (
    <ul className="timeline">
      {entries.map((entry) => {
        if (entry.kind === 'finding') {
          const f = entry.data
          return (
            <li key={`f-${f.id}`} className="timeline-item timeline-finding">
              <div className="timeline-head">
                <span className="timeline-kind">Finding{f.is_critical_pm ? ' · critical PM' : ''}</span>
                <span className="timeline-date mono">{f.occurrence_date}</span>
              </div>
              <p className="timeline-title">{f.pm_task}</p>
              {f.reason_given && <p className="timeline-detail">&ldquo;{f.reason_given}&rdquo;</p>}
              <div className="timeline-meta">
                {f.occurrence_url && (
                  <a href={f.occurrence_url} target="_blank" rel="noreferrer">
                    FMX occurrence ↗
                  </a>
                )}
                {f.reported_by && <span>Reported by {f.reported_by}</span>}
              </div>
            </li>
          )
        }
        const a = entry.data
        const info = stepInfo(a.step)
        return (
          <li key={`a-${a.id}`} className="timeline-item timeline-action">
            <div className="timeline-head">
              <span className="timeline-kind">
                Step {info?.number} · {info?.label}
              </span>
              <span className="timeline-date mono">{a.action_date}</span>
            </div>
            {a.skip_reason && <p className="timeline-detail">Skipped to this step: {a.skip_reason}</p>}
            {a.notes && <p className="timeline-detail">{a.notes}</p>}
            <div className="timeline-meta">
              {a.expires_at && <span>Active until {a.expires_at}</span>}
              {a.created_by && <span>Logged by {a.created_by}</span>}
            </div>
          </li>
        )
      })}
    </ul>
  )
}

function TechnicianRow({ tech, findings, actions }) {
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
        <span className="tech-row-leader">{tech.leaderName}</span>
        <StatusPill action={current} />
        <span className="tech-row-caret">{open ? '−' : '+'}</span>
      </button>
      {open && (
        <div className="tech-row-detail">
          <Timeline findings={techFindings} actions={techActions} />
          <details className="log-action">
            <summary>Log a discipline action for {tech.name}</summary>
            <ActionForm technicianName={tech.name} />
          </details>
        </div>
      )}
    </li>
  )
}

export function ComplianceExplorer({ technicians, findings, actions }) {
  const actionedFindingIds = new Set(actions.map((a) => a.finding_id).filter(Boolean))
  const openFindings = findings.filter((f) => !actionedFindingIds.has(f.id))
  const byLeader = new Map()
  for (const tech of technicians) {
    if (!byLeader.has(tech.leaderName)) byLeader.set(tech.leaderName, [])
    byLeader.get(tech.leaderName).push(tech)
  }

  return (
    <>
      <section className="panel">
        <h2>Log a PM compliance finding</h2>
        <p className="panel-sub">
          Record every non-compliant PM occurrence here, whether or not it leads to discipline yet.
        </p>
        <FindingForm technicians={technicians} />
      </section>

      <section className="panel">
        <h2>
          Findings awaiting action <span className="count-badge mono">{openFindings.length}</span>
        </h2>
        <p className="panel-sub">Findings that don&rsquo;t have a discipline action logged against them yet.</p>
        {openFindings.length === 0 ? (
          <p className="empty-note">Nothing outstanding.</p>
        ) : (
          <ul className="queue">
            {openFindings.map((f) => (
              <QueueItem key={f.id} finding={f} />
            ))}
          </ul>
        )}
      </section>

      <section className="panel">
        <h2>Roster &amp; discipline status</h2>
        <p className="panel-sub">Grouped by responsible leader. Click a technician to see their full history.</p>
        {[...byLeader.entries()].map(([leaderName, techs]) => (
          <div key={leaderName} className="leader-group">
            <h3>{leaderName}</h3>
            <ul className="tech-list">
              {techs.map((tech) => (
                <TechnicianRow key={tech.name} tech={tech} findings={findings} actions={actions} />
              ))}
            </ul>
          </div>
        ))}
      </section>
    </>
  )
}

function QueueItem({ finding }) {
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
            <summary>Log a discipline action for {finding.technician_name}</summary>
            <ActionForm technicianName={finding.technician_name} findingId={finding.id} />
          </details>
        </div>
      )}
    </li>
  )
}
