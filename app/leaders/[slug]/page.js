import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getLeaderBySlug } from '../../../lib/roster'
import { loadComplianceData } from '../../../lib/complianceData'
import { TeamSection } from '../../../components/TeamSection'
import { DisciplineGuide } from '../../../components/DisciplineGuide'

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

  return (
    <div className="wrap">
      <nav className="subnav">
        <Link href="/">← All leaders</Link>
      </nav>

      <header className="top" style={accentStyle(leader.color)}>
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

      <section className="panel">
        <h2>Team</h2>
        <p className="panel-sub">Outstanding findings for this team, then the full roster with discipline status.</p>
        <TeamSection leader={leader} findings={findings} actions={actions} />
      </section>

      <section className="panel">
        <h2>How to apply disciplinary action</h2>
        <DisciplineGuide />
      </section>
    </div>
  )
}
