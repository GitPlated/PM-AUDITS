import Link from 'next/link'
import { LEADERS } from '../../lib/roster'
import { DISCIPLINE_STEPS, allTechnicians } from '../../lib/compliance'
import { loadComplianceData, unactionedFindings } from '../../lib/complianceData'
import { Timeline } from '../../components/Timeline'
import { StepTrack } from '../../components/StepTrack'
import { FindingForm } from '../../components/FindingForm'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Admin — IL01 Aurora',
}

export default async function AdminPage() {
  const { findings, actions, connected } = await loadComplianceData()
  const openFindings = unactionedFindings(findings, actions)
  const criticalCount = findings.filter((f) => f.is_critical_pm).length

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

      <a href="#submit-a-finding" className="guide-cta submit-cta">
        <span>
          <span className="guide-cta-title">+ Submit a finding</span>
          <span className="guide-cta-sub">Log a PM compliance finding for any technician</span>
        </span>
        <span className="guide-cta-arrow" aria-hidden="true">
          ↓
        </span>
      </a>

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
        <h2>By technician</h2>
        <p className="panel-sub">
          Discipline actions in order, oldest to newest, left to right. Click a technician for the full
          history, including findings.
        </p>
        {LEADERS.map((leader) => {
          const leaderTechs = technicians.filter((t) => t.leaderName === leader.name)
          return (
            <div className="leader-group" key={leader.name}>
              <h3>{leader.name}</h3>
              <ul className="tech-track-list">
                {leaderTechs.map((t) => {
                  const techFindings = findings.filter((f) => f.technician_name === t.name)
                  const techActions = actions.filter((a) => a.technician_name === t.name)
                  return (
                    <details className="drill-row tech-track-row" key={t.name}>
                      <summary className="tech-track-summary">
                        <span className="tech-track-name">{t.name}</span>
                        {techActions.length === 0 ? (
                          <span className="empty-note">No discipline actions logged.</span>
                        ) : (
                          <StepTrack actions={techActions} />
                        )}
                      </summary>
                      <div className="drill-content">
                        <Timeline findings={techFindings} actions={techActions} />
                      </div>
                    </details>
                  )
                })}
              </ul>
            </div>
          )
        })}
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

      <section className="panel" id="submit-a-finding">
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
