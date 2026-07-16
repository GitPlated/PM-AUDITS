import Link from 'next/link'
import { supabase } from '../../lib/supabaseClient'
import { DISCIPLINE_STEPS, WORDING_GUIDE_URL, allTechnicians } from '../../lib/compliance'
import { ComplianceExplorer } from './ComplianceExplorer'

export const metadata = {
  title: 'PM Compliance Tracker — IL01 Aurora',
  description: 'Track PM compliance findings and progressive discipline actions by technician.',
}

export const dynamic = 'force-dynamic'

async function loadData() {
  if (!supabase) return { findings: [], actions: [], connected: false }

  const [findingsRes, actionsRes] = await Promise.all([
    supabase.from('pm_findings').select('*').order('occurrence_date', { ascending: false }),
    supabase.from('discipline_actions').select('*').order('action_date', { ascending: false }),
  ])

  if (findingsRes.error) console.error(findingsRes.error)
  if (actionsRes.error) console.error(actionsRes.error)

  return {
    findings: findingsRes.data ?? [],
    actions: actionsRes.data ?? [],
    connected: true,
  }
}

export default async function CompliancePage() {
  const { findings, actions, connected } = await loadData()
  const technicians = allTechnicians()

  return (
    <div className="wrap">
      <nav className="subnav">
        <Link href="/">← Accountability roster</Link>
      </nav>

      <header className="top">
        <div className="title-block">
          <p className="eyebrow">IL01 — Aurora, IL &nbsp;·&nbsp; PM Compliance Tracker</p>
          <h1>Track it, action it</h1>
          <p className="sub">
            Log PM compliance findings and walk them through the disciplinary ladder — from documented
            coaching to termination.
          </p>
        </div>
      </header>

      {!connected && (
        <div className="notice-panel notice-warn">
          <span className="mark">!</span>
          <div>
            <h3>Supabase isn&rsquo;t connected yet</h3>
            <p>
              Findings and discipline actions won&rsquo;t save until <code>NEXT_PUBLIC_SUPABASE_URL</code> and{' '}
              <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> are set (see <code>.env.example</code>) and{' '}
              <code>supabase/schema.sql</code> has been run against that project. The reference material below
              works regardless.
            </p>
          </div>
        </div>
      )}

      <section className="panel">
        <h2>The four-step ladder</h2>
        <div className="steps">
          {DISCIPLINE_STEPS.map((step) => (
            <div className="step-card" key={step.key}>
              <div className="step-number mono">{step.number}</div>
              <h3>{step.label}</h3>
              <p>{step.instructions}</p>
              {step.expiresAfterMonths && <p className="step-expiry">Expires after {step.expiresAfterMonths} months</p>}
              <a className="btn btn-sm" href={step.formUrl} target="_blank" rel="noreferrer">
                Open {step.formLabel} ↗
              </a>
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <h2>Skipping steps for egregious violations</h2>
        <p className="panel-sub">
          Safety or workplace-policy violations serious enough can skip levels of the ladder above. Use the
          table below (from the handbook) to decide the correct starting step.
        </p>
        <div className="callout callout-pending">
          <span className="mark">⚠</span>
          <div>
            <h3>Table pending</h3>
            <p>
              The handbook table referenced for skip-level violations didn&rsquo;t come through as text or an
              image in our chat — send it over (paste the rows, or attach the image) and it&rsquo;ll go here
              verbatim so leaders can reference it in place.
            </p>
          </div>
        </div>
      </section>

      <section className="panel">
        <h2>How to word the conversation</h2>
        <p className="panel-sub">
          Guidance on how to phrase these conversations with a technician, before you start:
        </p>
        <a className="btn btn-sm" href={WORDING_GUIDE_URL} target="_blank" rel="noreferrer">
          Open conversation wording guide ↗
        </a>
      </section>

      <ComplianceExplorer technicians={technicians} findings={findings} actions={actions} />
    </div>
  )
}
