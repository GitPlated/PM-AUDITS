import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getLeaderBySlug, leaderSlug } from '../../../lib/roster'
import { allTechnicians } from '../../../lib/compliance'
import { loadComplianceData } from '../../../lib/complianceData'
import { TeamSection } from '../../../components/TeamSection'
import { FindingForm } from '../../../components/FindingForm'
import { StepIcon } from '../../../components/StepIcon'

export const dynamic = 'force-dynamic'

function accentStyle(color) {
  return {
    '--accent': `var(--${color})`,
    '--accent-bg': `var(--${color}-bg)`,
    '--accent-line': `var(--${color}-line)`,
  }
}

export default async function LeaderPage({ params }) {
  const leader = getLeaderBySlug(params.slug)
  if (!leader) notFound()

  const { findings: allFindings, actions: allActions, connected } = await loadComplianceData()
  const findings = allFindings.filter((f) => f.leader_name === leader.name)
  const actions = allActions.filter((a) => a.leader_name === leader.name)

  const activeCount = leader.shifts.reduce((n, s) => n + s.techs.filter((t) => !t.vacant).length, 0)
  const vacantCount = leader.shifts.reduce((n, s) => n + s.techs.filter((t) => t.vacant).length, 0)
  const leaderTechnicians = allTechnicians().filter((t) => t.leaderName === leader.name)

  return (
    <div className="wrap" style={accentStyle(leader.color)}>
      <nav className="subnav">
        <Link href="/">← All leaders</Link>
      </nav>

      <header className="top">
        <div className="title-block">
          <p className="eyebrow" style={{ color: 'var(--accent)' }}>
            IL01 — Aurora, IL &nbsp;·&nbsp; Responsible leader
          </p>
          <h1>{leader.name}</h1>
          <p className="sub">
            {activeCount} technician{activeCount === 1 ? '' : 's'}
            {vacantCount > 0 ? ` · ${vacantCount} open position${vacantCount === 1 ? '' : 's'}` : ''}
          </p>
        </div>
        <div className="badges">
          {leader.badges.map((badge) => (
            <span
              className="badge"
              key={badge}
              style={{ background: 'var(--accent-bg)', color: 'var(--accent)', borderColor: 'var(--accent-line)' }}
            >
              {badge}
            </span>
          ))}
        </div>
      </header>

      {!connected && (
        <div className="notice-panel notice-warn">
          <span className="mark">!</span>
          <div>
            <h3>Supabase isn&rsquo;t connected yet</h3>
            <p>Findings and discipline actions won&rsquo;t save or load until Supabase is configured.</p>
          </div>
        </div>
      )}

      <Link href={`/guide?leader=${leaderSlug(leader.name)}`} className="guide-cta">
        <span className="guide-cta-main">
          <StepIcon step="guide" className="guide-cta-icon" />
          <span>
            <span className="guide-cta-title">How to apply disciplinary action</span>
            <span className="guide-cta-sub">Steps, forms, the skip-level table, and the wording guide</span>
          </span>
        </span>
        <span className="guide-cta-arrow" aria-hidden="true">
          →
        </span>
      </Link>

      <details className="submit-drop">
        <summary className="guide-cta">
          <span className="guide-cta-main">
            <StepIcon step="finding" className="guide-cta-icon" />
            <span>
              <span className="guide-cta-title">Log a PM compliance finding for a technician</span>
              <span className="guide-cta-sub">Reported by is signed automatically as {leader.name}</span>
            </span>
          </span>
          <span className="guide-cta-arrow" aria-hidden="true">
            ⌄
          </span>
        </summary>
        <div className="submit-drop-content">
          <FindingForm technicians={leaderTechnicians} leaderName={leader.name} />
        </div>
      </details>

      <section className="panel">
        <h2>Team</h2>
        <p className="panel-sub">Outstanding findings for this team, then the full roster with discipline status.</p>
        <TeamSection leader={leader} findings={findings} actions={actions} />
      </section>
    </div>
  )
}
