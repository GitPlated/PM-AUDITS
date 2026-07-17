import Link from 'next/link'
import { LEADERS } from '../../lib/roster'
import { DISCIPLINE_STEPS, allTechnicians } from '../../lib/compliance'
import { loadComplianceData, unactionedFindings } from '../../lib/complianceData'
import { Timeline } from '../../components/Timeline'
import { FindingForm } from '../../components/FindingForm'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Admin — IL01 Aurora',
}

export default async function AdminPage() {
  const { findings, actions, connected } = await loadComplianceData()
  const openFindings = unactionedFindings(findings, actions)
  const criticalCount = findings.filter((f) => f.is_critical_pm).length

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

  const coachingUploads = actions
    .filter((a) => a.step === 'coaching' && a.coaching_photo_url)
    .sort((a, b) => new Date(b.action_date) - new Date(a.action_date))

  const technicians = allTechnicians()

  return (
    <div className="wrap">
      <nav className="subnav">
        <Link href="/">← All leaders</Link>
      </nav>

      <header className="top">
        <div className="title-block">
          <p className="eyebrow">IL01 — Aurora, IL &nbsp;·&nbsp; Admin</p>
          <h1>Admin</h1>
          <p className="sub">Trends across every leader, a standalone finding intake, and coaching form uploads.</p>
        </div>
      </header>

      {!connected && (
        <div className="notice-panel notice-warn">
          <span className="mark">!</span>
          <div>
            <h3>Supabase isn&rsquo;t connected yet</h3>
            <p>Nothing to show or save until Supabase is configured.</p>
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

      <section className="panel">
        <h2>Submit a finding</h2>
        <p className="panel-sub">Pick any technician — it lands in their responsible leader&rsquo;s queue automatically.</p>
        <FindingForm technicians={technicians} />
      </section>

      <section className="panel">
        <h2>
          Documented coaching uploads <span className="count-badge mono">{coachingUploads.length}</span>
        </h2>
        <p className="panel-sub">Photos of completed Documented Coaching forms, most recent first.</p>
        {coachingUploads.length === 0 ? (
          <p className="empty-note">No uploads yet.</p>
        ) : (
          <ul className="coaching-uploads">
            {coachingUploads.map((a) => (
              <li className="coaching-upload" key={a.id}>
                <a href={a.coaching_photo_url} target="_blank" rel="noreferrer">
                  <img src={a.coaching_photo_url} alt={`Coaching form for ${a.technician_name}`} />
                </a>
                <div className="coaching-upload-meta">
                  <span className="coaching-upload-name">{a.technician_name}</span>
                  <span className="coaching-upload-sub">
                    {a.leader_name} · {a.action_date}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
