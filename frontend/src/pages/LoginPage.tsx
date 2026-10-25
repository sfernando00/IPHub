import { useState, type FormEvent } from 'react'
import { CircleAlert, CircleCheck, Lock, ShieldCheck, User } from 'lucide-react'
import MicrosoftLogo from '../components/MicrosoftLogo.tsx'
import SubmitButton from '../components/SubmitButton.tsx'
import TextField from '../components/TextField.tsx'
import { AuthError, login } from '../services/auth.ts'

type FieldErrors = Partial<Record<'username' | 'password', string>>

interface LoginPageProps {
  registeredUsername?: string
}

export default function LoginPage({ registeredUsername }: LoginPageProps) {
  const [username, setUsername] = useState(registeredUsername ?? '')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(
    registeredUsername ? 'Account created. Sign in to continue.' : null,
  )
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError(null)
    setNotice(null)

    const errors: FieldErrors = {}
    if (!username.trim()) errors.username = 'Please enter your username.'
    if (!password) errors.password = 'Please enter your password.'
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
    <>
      <header className="auth-heading">
        <h2>Welcome back</h2>
        <p>Sign in to access the IP Management System</p>
      </header>

      {formError && (
        <div className="alert alert-error" role="alert">
          <CircleAlert size={18} aria-hidden="true" />
          {formError}
        </div>
      )}
      {notice && (
        <div className="alert alert-success" role="status">
          <CircleCheck size={18} aria-hidden="true" />
          {notice}
        </div>
      )}

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <TextField
          id="username"
          label="Username"
          icon={User}
          value={username}
          onChange={setUsername}
          placeholder="Enter your username"
          autoComplete="username"
          error={fieldErrors.username}
          disabled={submitting}
        />
        <TextField
          id="password"
          label="Password"
          icon={Lock}
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="Enter your password"
          autoComplete="current-password"
          error={fieldErrors.password}
          disabled={submitting}
        />

        <div className="form-row">
          <label className="checkbox">
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
            <span>Remember me</span>
          </label>
          <a href="#forgot-password" className="text-link">
            Forgot password?
          </a>
        </div>

        <SubmitButton label="Sign In" busyLabel="Signing in…" busy={submitting} />
      </form>

      <div className="divider">
        <span>or</span>
      </div>

      <button
        type="button"
        className="btn-secondary"
        onClick={() => {
          setFormError(null)
          setNotice('Microsoft sign-in is not set up yet.')
        }}
      >
        <MicrosoftLogo size={18} />
        Sign in with Microsoft
      </button>

      <p className="footnote">
        <ShieldCheck size={14} aria-hidden="true" />
        Authorized access only. All activities are monitored.
      </p>
    </>
  )
}
