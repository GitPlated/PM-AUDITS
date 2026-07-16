import Link from 'next/link'
import { LEADERS } from '../../lib/roster'
import { DISCIPLINE_STEPS } from '../../lib/compliance'
import { loadComplianceData, unactionedFindings } from '../../lib/complianceData'

export const dynamic = 'force-dynamic'

export default async function TrendsPage() {
  const { findings, actions, connected } = await loadComplianceData()
  const openFindings = unactionedFindings(findings, actions)
  const criticalCount = findings.filter((f) => f.is_critical_pm).length

  const byLeader = LEADERS.map((leader) => {
    const lf = findings.filter((f) => f.leader_name === leader.name)
    const open = unactionedFindings(lf, actions.filter((a) => a.leader_name === leader.name))
    return { name: leader.name, total: lf.length, open: open.length }
  })
  const maxByLeader = Math.max(1, ...byLeader.map((l) => l.total))

  const byStep = DISCIPLINE_STEPS.map((step) => ({
    key: step.key,
    label: step.label,
    count: actions.filter((a) => a.step === step.key).length,
  }))
  const maxByStep = Math.max(1, ...byStep.map((s) => s.count))

  return (
    <div className="wrap">
      <nav className="subnav">
        <Link href="/">← All leaders</Link>
      </nav>

      <header className="top">
        <div className="title-block">
          <p className="eyebrow">IL01 — Aurora, IL &nbsp;·&nbsp; Trends</p>
          <h1>Across every leader</h1>
          <p className="sub">Findings and discipline activity for the whole site, not filtered to one team.</p>
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
        <div className="bar-list">
          {byLeader.map((l) => (
            <div className="bar-row" key={l.name}>
              <span className="bar-label">{l.name}</span>
              <div className="bar-track">
                <div className="bar-fill" style={{ width: `${(l.total / maxByLeader) * 100}%` }} />
              </div>
              <span className="bar-value mono">
                {l.total} <span className="bar-sub">({l.open} open)</span>
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <h2>Discipline actions by step</h2>
        <div className="bar-list">
          {byStep.map((s) => (
            <div className="bar-row" key={s.key}>
              <span className="bar-label">{s.label}</span>
              <div className="bar-track">
                <div className="bar-fill bar-fill-step" style={{ width: `${(s.count / maxByStep) * 100}%` }} />
              </div>
              <span className="bar-value mono">{s.count}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
