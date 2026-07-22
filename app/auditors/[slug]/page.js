import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAuditorBySlug } from '../../../lib/auditors'
import { allTechnicians } from '../../../lib/compliance'
import { loadComplianceData } from '../../../lib/complianceData'
import { FindingForm } from '../../../components/FindingForm'
import { StepIcon } from '../../../components/StepIcon'
import { ShiftHeatmap } from '../../../components/ShiftHeatmap'
import { Timeline } from '../../../components/Timeline'

export const dynamic = 'force-dynamic'

function accentStyle(color) {
  return {
    '--accent': `var(--${color})`,
    '--accent-bg': `var(--${color}-bg)`,
    '--accent-line': `var(--${color}-line)`,
  }
}

export default async function AuditorPage({ params }) {
  const auditor = getAuditorBySlug(params.slug)
  if (!auditor) notFound()

  const { findings, actions, connected } = await loadComplianceData()
  const technicians = allTechnicians()
  const techShiftMap = new Map(technicians.map((t) => [t.name, t.shiftCode]))

  const findingsByTech = technicians
    .map((t) => ({
      name: t.name,
      leaderName: t.leaderName,
      count: findings.filter((f) => f.technician_name === t.name).length,
    }))
    .sort((a, b) => b.count - a.count)
  const maxFindingsPerTech = Math.max(1, ...findingsByTech.map((t) => t.count))

  return (
    <div className="wrap" style={accentStyle(auditor.color)}>
      <nav className="subnav">
        <Link href="/">← All leaders</Link>
      </nav>

      <header className="top">
        <div className="title-block">
          <p className="eyebrow" style={{ color: 'var(--accent)' }}>
            IL01 — Aurora, IL &nbsp;·&nbsp; Auditor
          </p>
          <h1>{auditor.name}</h1>
          <p className="sub">Findings across every team — not tied to a specific leader&rsquo;s roster.</p>
        </div>
      </header>

      {!connected && (
        <div className="notice-panel notice-warn">
          <span className="mark">!</span>
          <div>
            <h3>Supabase isn&rsquo;t connected yet</h3>
            <p>Findings won&rsquo;t save or load until Supabase is configured.</p>
          </div>
        </div>
      )}

      <details className="submit-drop">
        <summary className="guide-cta">
          <span className="guide-cta-main">
            <StepIcon step="finding" className="guide-cta-icon" />
            <span>
              <span className="guide-cta-title">Log a PM compliance finding for a technician</span>
              <span className="guide-cta-sub">Reported by is signed automatically as {auditor.name}</span>
            </span>
          </span>
          <span className="guide-cta-arrow" aria-hidden="true">
            ⌄
          </span>
        </summary>
        <div className="submit-drop-content">
          <FindingForm technicians={technicians} leaderName={auditor.name} />
        </div>
      </details>

      <details className="submit-drop">
        <summary className="guide-cta">
          <span className="guide-cta-main">
            <StepIcon step="reactive" className="guide-cta-icon" />
            <span>
              <span className="guide-cta-title">Log reactive WO compliance finding</span>
              <span className="guide-cta-sub">Reported by is signed automatically as {auditor.name}</span>
            </span>
          </span>
          <span className="guide-cta-arrow" aria-hidden="true">
            ⌄
          </span>
        </summary>
        <div className="submit-drop-content">
          <FindingForm technicians={technicians} leaderName={auditor.name} findingType="reactive_wo" />
        </div>
      </details>

      <section className="panel">
        <h2>Findings by shift</h2>
        <p className="panel-sub">Where findings have been concentrated, across every leader&rsquo;s team.</p>
        <ShiftHeatmap findings={findings} techShiftMap={techShiftMap} />
      </section>

      <section className="panel">
        <h2>Findings by technician</h2>
        <p className="panel-sub">Every technician, most findings first. Click one for their full history.</p>
        <div className="bar-list">
          {findingsByTech.map((t) => {
            const techFindings = findings.filter((f) => f.technician_name === t.name)
            const techActions = actions.filter((a) => a.technician_name === t.name)
            return (
              <details className="drill-row" key={t.name}>
                <summary className="bar-row">
                  <span className="bar-label">
                    {t.name} <span className="bar-sub">· {t.leaderName}</span>
                  </span>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: `${(t.count / maxFindingsPerTech) * 100}%` }} />
                  </div>
                  <span className="bar-value mono">{t.count}</span>
                </summary>
                <div className="drill-content">
                  {t.count === 0 ? (
                    <p className="empty-note">No findings logged.</p>
                  ) : (
                    <Timeline findings={techFindings} actions={techActions} />
                  )}
                </div>
              </details>
            )
          })}
        </div>
      </section>
    </div>
  )
}
