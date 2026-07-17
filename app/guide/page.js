import Link from 'next/link'
import { getLeaderBySlug, leaderSlug } from '../../lib/roster'
import { DisciplineGuide } from '../../components/DisciplineGuide'

export const metadata = {
  title: 'How to Apply Disciplinary Action — IL01 Aurora',
}

function accentStyle(color) {
  return {
    '--accent': `var(--${color})`,
    '--accent-bg': `var(--${color}-bg)`,
    '--accent-line': `var(--${color}-line)`,
  }
}

export default function GuidePage({ searchParams }) {
  const leader = searchParams?.leader ? getLeaderBySlug(searchParams.leader) : null

  return (
    <div className="wrap" style={leader ? accentStyle(leader.color) : undefined}>
      <nav className="subnav">
        <Link href={leader ? `/leaders/${leaderSlug(leader.name)}` : '/'}>
          ← {leader ? `${leader.name}'s team` : 'All leaders'}
        </Link>
      </nav>

      <header className="top">
        <div className="title-block">
          <p className="eyebrow">IL01 — Aurora, IL &nbsp;·&nbsp; Reference guide</p>
          <h1>How to apply disciplinary action</h1>
          <p className="sub">Four steps, in order — unless the skip-level table below says otherwise.</p>
        </div>
      </header>

      <DisciplineGuide />
    </div>
  )
}
