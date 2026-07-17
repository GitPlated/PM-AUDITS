export const metadata = {
  title: 'Sign in — Disciplinary Actions Tracker',
}

export default function LoginPage({ searchParams }) {
  const next = searchParams?.next || '/'
  const hasError = searchParams?.error === '1'

  return (
    <div className="auth-wrap">
      <form className="auth-card" method="POST" action="/api/login">
        <p className="eyebrow">IL01 — Aurora, IL</p>
        <h1>Disciplinary Actions Tracker</h1>
        <p className="sub">Enter the site password to continue.</p>
        <input type="hidden" name="next" value={next} />
        <label>
          Password
          <input type="password" name="password" required autoFocus />
        </label>
        {hasError && <p className="form-message error">Incorrect password.</p>}
        <button type="submit" className="btn">
          Continue
        </button>
      </form>
    </div>
  )
}
