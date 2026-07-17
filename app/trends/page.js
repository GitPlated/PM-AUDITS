import Link from 'next/link'
import { LEADERS } from '../../lib/roster'
import { DISCIPLINE_STEPS } from '../../lib/compliance'
import { loadComplianceData, unactionedFindings } from '../../lib/complianceData'
import { Timeline } from '../../components/Timeline'

export const dynamic = 'force-dynamic'

export default async function TrendsPage() {
  const { findings, actions, connected } = await loadComplianceData()
  const openFindings = unactionedFindings(findings, actions)
  const criticalCount = findings.filter((f) => f.is_critical_pm).length

  // Every finding AND every discipline action counts toward a leader's total —
  // an action doesn't have to trace back to a logged finding (e.g. a time-theft
  // write-up skips straight to a step with no PM finding behind it).
  const byLeader = LEADERS.map((leader) => {
    const lf = findings.filter((f) => f.leader_name === leader.name)
    const la = actions.filter((a) => a.leader_name === leader.name)
    const open = unactionedFindings(lf, la)
    return { name: leader.name, findings: lf, actions: la, total: lf.length + la.length, open: open.length }
  })
  const maxByLeader = Math.max(1, ...byLeader.map((l) => l.total))

  const byStep = DISCIPLINE_STEPS.map((step) => ({
    key: step.key,
    label: step.label,
    actions: actions.filter((a) => a.step === step.key),
  }))
  const maxByStep = Math.max(1, ...byStep.map((s) => s.actions.length))

  return (
    <div className="wrap">
      <nav className="subnav">
        <Link href="/">← All leaders</Link>
      </nav>

      <header className="top">
        <div className="title-block">
          <p className="eyebrow">IL01 — Aurora, IL &nbsp;·&nbsp; Trends</p>
          <h1>Across every leader</h1>
          <p className="sub">Findings and discipline actions for the whole site, not filtered to one team.</p>
        </div>
      </header>

      {!connected && (
        <div className="notice-panel notice-warn">
          <span className="mark">!</span>
          <div>
            <h3>Supabase isn&rsquo;t connected yet</h3>
            <p>Nothing to show until findings/actions exist and Supabase is configured.</p>
          </div>
        </div>
      )}

      <div className="stat-grid">
        <div className="stat-block">
          <div className="num mono">{findings.length}</div>
          <div className="lbl">Findings logged</div>
        </div>
        <div className="stat-block">
          <div className="num mono" style={openFindings.length > 0 ? { color: 'var(--alert)' } : undefined}>
            {openFindings.length}
          </div>
          <div className="lbl">Awaiting action</div>
        </div>
        <div className="stat-block">
          <div className="num mono">{actions.length}</div>
          <div className="lbl">Actions logged</div>
        </div>
        <div className="stat-block">
          <div className="num mono">{criticalCount}</div>
          <div className="lbl">Critical PM findings</div>
        </div>
      </div>

      <section className="panel">
        <h2>Findings by leader</h2>
        <p className="panel-sub">
          Counts every PM finding plus every discipline action logged for that leader&rsquo;s team. Click a
          leader to see the individual entries.
        </p>
        <div className="bar-list">
          {byLeader.map((l) => (
            <details className="drill-row" key={l.name}>
              <summary className="bar-row">
                <span className="bar-label">{l.name}</span>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${(l.total / maxByLeader) * 100}%` }} />
                </div>
                <span className="bar-value mono">
                  {l.total} <span className="bar-sub">({l.open} open)</span>
                </span>
              </summary>
              <div className="drill-content">
                {l.total === 0 ? (
                  <p className="empty-note">Nothing logged for this team yet.</p>
                ) : (
                  <Timeline findings={l.findings} actions={l.actions} />
                )}
              </div>
            </details>
          ))}
        </div>
      </section>

      <section className="panel">
        <h2>Discipline actions by step</h2>
        <p className="panel-sub">Every action logged, organization-wide. Click a step to see who and when.</p>
        <div className="bar-list">
          {byStep.map((s) => (
            <details className="drill-row" key={s.key}>
              <summary className="bar-row">
                <span className="bar-label">{s.label}</span>
                <div className="bar-track">
                  <div className="bar-fill bar-fill-step" style={{ width: `${(s.actions.length / maxByStep) * 100}%` }} />
                </div>
                <span className="bar-value mono">{s.actions.length}</span>
              </summary>
              <div className="drill-content">
                {s.actions.length === 0 ? (
                  <p className="empty-note">No one has been through this step.</p>
                ) : (
                  <ul className="timeline">
                    {s.actions
                      .slice()
                      .sort((a, b) => new Date(b.action_date) - new Date(a.action_date))
                      .map((a) => (
                        <li className="timeline-item timeline-action" key={a.id}>
                          <div className="timeline-head">
                            <span className="timeline-kind">
                              {a.technician_name} · {a.leader_name}
                            </span>
                            <span className="timeline-date mono">{a.action_date}</span>
                          </div>
                          {a.skip_reason && <p className="timeline-detail">Skipped to this step: {a.skip_reason}</p>}
                          {a.notes && <p className="timeline-detail">{a.notes}</p>}
                        </li>
                      ))}
                  </ul>
                )}
              </div>
            </details>
          ))}
        </div>
      </section>
    </div>
  )
}
