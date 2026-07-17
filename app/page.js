import Link from 'next/link'
import { LEADERS, getSummary, leaderSlug } from '../lib/roster'
import { loadComplianceData, unactionedFindings } from '../lib/complianceData'
import { NotifyBadge } from '../components/NotifyBadge'

export const dynamic = 'force-dynamic'

function accentStyle(color) {
  return {
    '--accent': `var(--${color})`,
    '--accent-bg': `var(--${color}-bg)`,
    '--accent-line': `var(--${color}-line)`,
  }
}

export default async function Page() {
  const summary = getSummary(LEADERS)
  const { findings, actions, connected } = await loadComplianceData()
  const openFindings = unactionedFindings(findings, actions)

  return (
    <div className="wrap">
      <header className="top">
        <div className="title-block">
          <p className="eyebrow">IL01 — Aurora, IL</p>
          <h1>Disciplinary Actions Tracker</h1>
          <p className="sub">Pick a leader to see their team and take action, or check trends across everyone.</p>
        </div>
        <div className="stat-row">
          <div className="stat">
            <div className="num mono">{summary.techs}</div>
            <div className="lbl">Technicians</div>
          </div>
          <div className="stat">
            <div className="num mono">{summary.leaders}</div>
            <div className="lbl">Leaders</div>
          </div>
          <div className="stat">
            <div className="num mono" style={{ color: 'var(--info)' }}>
              {summary.vacant}
            </div>
            <div className="lbl">Open positions</div>
          </div>
          <div className="stat">
            <div className="num mono" style={openFindings.length > 0 ? { color: 'var(--alert)' } : undefined}>
              {openFindings.length}
            </div>
            <div className="lbl">Findings awaiting action</div>
          </div>
        </div>
      </header>

      {!connected && (
        <div className="notice-panel notice-warn">
          <span className="mark">!</span>
          <div>
            <h3>Supabase isn&rsquo;t connected yet</h3>
            <p>
              Findings and discipline actions won&rsquo;t save or load until <code>NEXT_PUBLIC_SUPABASE_URL</code>{' '}
              and <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> are set (see <code>.env.example</code>) and{' '}
              <code>supabase/schema.sql</code> has been run against that project.
            </p>
          </div>
        </div>
      )}

      <div className="grid">
        {LEADERS.map((leader) => {
          const purview = leader.shifts.reduce(
            (n, shift) => n + shift.techs.filter((t) => !t.vacant).length,
            0
          )
          const leaderOpenCount = openFindings.filter((f) => f.leader_name === leader.name).length
          return (
            <Link
              href={`/leaders/${leaderSlug(leader.name)}`}
              className="card leader-card-link"
              style={accentStyle(leader.color)}
              key={leader.name}
            >
              <NotifyBadge count={leaderOpenCount} />
              <div className="stripe" />
              <div className="head">
                <p className="role">Responsible leader</p>
                <h2>{leader.name}</h2>
                <div className="meta">
                  <div className="badges">
                    {leader.badges.map((badge) => (
                      <span className="badge" key={badge}>
                        {badge}
                      </span>
                    ))}
                  </div>
                  <span className="count">
                    Purview: <span className="n mono">{purview}</span>
                  </span>
                </div>
              </div>
              <div className="card-footer">
                <span className="card-cta">View team →</span>
              </div>
            </Link>
          )
        })}
      </div>

      <div className="grid action-grid">
        <Link href="/trends" className="tile">
          <h3>Trends</h3>
          <p>See findings and discipline activity across every leader.</p>
        </Link>
        <Link href="/submit" className="tile">
          <h3>Submit a finding</h3>
          <p>Log a PM compliance finding for any technician — it lands in the right leader&rsquo;s queue.</p>
        </Link>
      </div>

      <footer className="note">
        Source: Users for HelloFresh – all.csv (IL01 – Aurora, IL), reconciled against current shift rosters. Leader
        assignments: Tyler Christensen (FHD, FHS), Dave Haney (BHD, BHS), Ron Vogel (FHN), Wilberth Carrizal (BHN).
      </footer>
    </div>
  )
}
