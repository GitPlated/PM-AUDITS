import { LEADERS, getSummary } from '../lib/roster'

function accentStyle(color) {
  return {
    '--accent': `var(--${color})`,
    '--accent-bg': `var(--${color}-bg)`,
    '--accent-line': `var(--${color}-line)`,
  }
}

export default function Page() {
  const summary = getSummary(LEADERS)

  return (
    <div className="wrap">
      <header className="top">
        <div className="title-block">
          <p className="eyebrow">IL01 — Aurora, IL &nbsp;·&nbsp; Disciplinary Action Accountability</p>
          <h1>Who owns the write-up</h1>
          <p className="sub">
            Every technician mapped to the leader accountable for their disciplinary action, by shift and role.
          </p>
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
        </div>
      </header>

      <div className="legend">
        <span className="grp">
          <b>FH</b> Front Half
        </span>
        <span className="grp">
          <b>BH</b> Back Half
        </span>
        <span className="grp">
          <b>D</b> Days
        </span>
        <span className="grp">
          <b>S</b> Swing / Mids
        </span>
        <span className="grp">
          <b>N</b> Nights
        </span>
        <span className="grp">
          e.g. <b>FHD</b> = Front Half, Days
        </span>
      </div>

      <div className="grid">
        {LEADERS.map((leader) => {
          const purview = leader.shifts.reduce(
            (n, shift) => n + shift.techs.filter((t) => !t.vacant).length,
            0
          )
          return (
            <div className="card" style={accentStyle(leader.color)} key={leader.name}>
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
              <div className="roster">
                {leader.shifts.map((shift) => (
                  <div className="shift-block" key={shift.code}>
                    <div className="shift-title">
                      {shift.code} — {shift.label} ({shift.techs.filter((t) => !t.vacant).length})
                    </div>
                    <ul className="techs">
                      {shift.techs.map((tech, i) => (
                        <li className={tech.vacant ? 'vacant' : ''} key={tech.name ?? `${shift.code}-vacant-${i}`}>
                          <span className="name">{tech.vacant ? 'Open position' : tech.name}</span>
                          <span className="role-tag">{tech.role}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {summary.vacant > 0 && (
        <div className="notice-panel">
          <span className="mark">i</span>
          <div>
            <h3>
              {summary.vacant} open position{summary.vacant === 1 ? '' : 's'}
            </h3>
            <p>
              {summary.vacancies
                .map((v) => `${v.shiftLabel} has an unfilled ${v.role} slot`)
                .join(', ')}
              .
            </p>
          </div>
        </div>
      )}

      <footer className="note">
        Source: Users for HelloFresh – all.csv (IL01 – Aurora, IL), reconciled against current shift rosters. Leader
        assignments: Tyler Christensen (FHD, FHS), Dave Haney (BHD, BHS), Ron Vogel (FHN), Wilberth Carrizal (BHN).
      </footer>
    </div>
  )
}
