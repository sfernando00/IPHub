import { useState, type FormEvent } from 'react'
import {
  BarChart3,
  ChevronRight,
  Database,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Settings,
  ShieldCheck,
  User,
} from 'lucide-react'
import logo from '../assets/iphub-logo.png'
import MicrosoftLogo from '../components/MicrosoftLogo.tsx'
import NetworkBackdrop from '../components/NetworkBackdrop.tsx'
import { AuthError, login } from '../services/auth.ts'
import './LoginPage.css'

const features = [
  { icon: ShieldCheck, label: 'Secure' },
  { icon: Database, label: 'Centralized' },
  { icon: Settings, label: 'Efficient' },
  { icon: BarChart3, label: 'Better Planning' },
]

type FieldErrors = Partial<Record<'username' | 'password', string>>

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  function validate(): FieldErrors {
    const errors: FieldErrors = {}
    if (!username.trim()) errors.username = 'Please enter your username.'
    if (!password) errors.password = 'Please enter your password.'
    return errors
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError(null)
    setNotice(null)

    const errors = validate()
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    setSubmitting(true)
    try {
      const { full_name } = await login({ username: username.trim(), password }, remember)
      setNotice(`Welcome, ${full_name}! You are signed in.`)
    } catch (error) {
      setFormError(error instanceof AuthError ? error.message : 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="login-page">
      <aside className="brand-panel">
        <NetworkBackdrop />
        <div className="brand-content">
          <div className="brand-logo">
            <img src={logo} alt="" width={64} height={64} />
            <div>
              <span className="brand-name">IPHub</span>
              <span className="brand-slogan">Where Every IP Finds Its Place.</span>
            </div>
          </div>

          <div className="brand-hero">
            <h1>IP Management System</h1>
            <p className="brand-pillars">
              <span>Plan</span>
              <span aria-hidden="true">|</span>
              <span>Manage</span>
              <span aria-hidden="true">|</span>
              <span>Optimize</span>
            </p>
            <span className="brand-rule" aria-hidden="true" />
            <p className="brand-tagline">
              Reliable Networks
              <br />
              for a Connected Tomorrow
            </p>
          </div>

          <ul className="brand-features">
            {features.map(({ icon: Icon, label }) => (
              <li key={label}>
                <Icon size={30} strokeWidth={1.6} aria-hidden="true" />
                <span>{label}</span>
              </li>
            ))}
          </ul>

          <p className="brand-copyright">© {new Date().getFullYear()} IPHub. All rights reserved.</p>
        </div>
      </aside>

      <main className="form-panel">
        <nav className="top-links" aria-label="Support">
          <a href="#help">Help</a>
          <span aria-hidden="true">|</span>
          <a href="#contact">Contact Us</a>
        </nav>

        <section className="login-card" aria-labelledby="login-title">
          <img className="card-logo" src={logo} alt="IPHub" width={56} height={56} />
          <h2 id="login-title">Welcome Back</h2>
          <p className="login-subtitle">Sign in to access the IP Management System</p>

          {formError && (
            <div className="alert alert-error" role="alert">
              {formError}
            </div>
          )}
          {notice && (
            <div className="alert alert-info" role="status">
              {notice}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="field">
              <label htmlFor="username">Username</label>
              <div className={`input-wrap ${fieldErrors.username ? 'has-error' : ''}`}>
                <User className="input-icon" size={20} aria-hidden="true" />
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  aria-invalid={Boolean(fieldErrors.username)}
                  aria-describedby={fieldErrors.username ? 'username-error' : undefined}
                  disabled={submitting}
                />
              </div>
              {fieldErrors.username && (
                <p id="username-error" className="field-error">
                  {fieldErrors.username}
                </p>
              )}
            </div>

            <div className="field">
              <label htmlFor="password">Password</label>
              <div className={`input-wrap ${fieldErrors.password ? 'has-error' : ''}`}>
                <Lock className="input-icon" size={20} aria-hidden="true" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-invalid={Boolean(fieldErrors.password)}
                  aria-describedby={fieldErrors.password ? 'password-error' : undefined}
                  disabled={submitting}
                />
                <button
                  type="button"
                  className="toggle-visibility"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {fieldErrors.password && (
                <p id="password-error" className="field-error">
                  {fieldErrors.password}
                </p>
              )}
            </div>

            <div className="form-row">
              <label className="remember">
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                <span>Remember me</span>
              </label>
              <a href="#forgot-password" className="forgot-link">
                Forgot Password?
              </a>
            </div>

            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="spin" size={20} aria-hidden="true" />
                  Signing In…
                </>
              ) : (
                <>
                  Sign In
                  <ChevronRight size={20} aria-hidden="true" />
                </>
              )}
            </button>
          </form>

          <div className="divider">
            <span>or</span>
          </div>

          <button
            type="button"
            className="btn-microsoft"
            onClick={() => setNotice('Microsoft sign-in is not set up yet.')}
          >
            <MicrosoftLogo />
            Sign in with Microsoft
          </button>

          <p className="login-footnote">Authorized access only. All activities are monitored.</p>
        </section>
      </main>
    </div>
  )
}
