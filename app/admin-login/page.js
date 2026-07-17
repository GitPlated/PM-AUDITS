import Link from 'next/link'

export const metadata = {
  title: 'Admin sign in — Disciplinary Actions Tracker',
}

export default function AdminLoginPage({ searchParams }) {
  const next = searchParams?.next || '/admin'
  const hasError = searchParams?.error === '1'

  return (
    <div className="auth-wrap">
      <form className="auth-card" method="POST" action="/api/admin-login">
        <p className="eyebrow">IL01 — Aurora, IL &nbsp;·&nbsp; Admin</p>
        <h1>Admin access</h1>
        <p className="sub">This section needs its own password.</p>
        <input type="hidden" name="next" value={next} />
        <label>
          Admin password
          <input type="password" name="password" required autoFocus />
        </label>
        {hasError && <p className="form-message error">Incorrect password.</p>}
        <button type="submit" className="btn">
          Continue
        </button>
        <Link href="/" className="auth-back">
          ← Back to all leaders
        </Link>
      </form>
    </div>
  )
}
