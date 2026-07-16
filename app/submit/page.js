import Link from 'next/link'
import { allTechnicians } from '../../lib/compliance'
import { supabase } from '../../lib/supabaseClient'
import { FindingForm } from '../../components/FindingForm'

export const metadata = {
  title: 'Submit a finding — IL01 Aurora',
}

export default function SubmitPage() {
  const technicians = allTechnicians()

  return (
    <div className="wrap">
      <nav className="subnav">
        <Link href="/">← All leaders</Link>
      </nav>

      <header className="top">
        <div className="title-block">
          <p className="eyebrow">IL01 — Aurora, IL &nbsp;·&nbsp; Submit a finding</p>
          <h1>Log a PM compliance finding</h1>
          <p className="sub">Pick any technician — it lands in their responsible leader&rsquo;s queue automatically.</p>
        </div>
      </header>

      {!supabase && (
        <div className="notice-panel notice-warn">
          <span className="mark">!</span>
          <div>
            <h3>Supabase isn&rsquo;t connected yet</h3>
            <p>This form won&rsquo;t save until Supabase is configured (see .env.example / README).</p>
          </div>
        </div>
      )}

      <section className="panel">
        <FindingForm technicians={technicians} />
      </section>
    </div>
  )
}
