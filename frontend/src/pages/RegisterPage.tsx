import { useState, type FormEvent } from 'react'
import { AtSign, CircleAlert, IdCard, Lock, LockKeyhole, User } from 'lucide-react'
import PasswordStrength, { passwordScore } from '../components/PasswordStrength.tsx'
import SubmitButton from '../components/SubmitButton.tsx'
import TextField from '../components/TextField.tsx'
import { AuthError, register } from '../services/auth.ts'

type Field = 'fullName' | 'username' | 'email' | 'password' | 'confirm'
type FieldErrors = Partial<Record<Field, string>>

interface RegisterPageProps {
  onRegistered: (username: string) => void
}

const USERNAME_PATTERN = /^[A-Za-z0-9._-]{3,50}$/
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function RegisterPage({ onRegistered }: RegisterPageProps) {
  const [values, setValues] = useState<Record<Field, string>>({
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirm: '',
  })
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const set = (field: Field) => (value: string) => setValues((v) => ({ ...v, [field]: value }))

  function validate(): FieldErrors {
    const errors: FieldErrors = {}
    if (values.fullName.trim().length < 2) errors.fullName = 'Please enter your full name.'
    if (!USERNAME_PATTERN.test(values.username))
      errors.username = '3–50 letters, numbers, dots, dashes or underscores.'
    if (!EMAIL_PATTERN.test(values.email)) errors.email = 'Please enter a valid email.'
    if (values.password.length < 8) errors.password = 'Use at least 8 characters.'
    else if (new TextEncoder().encode(values.password).length > 72) errors.password = 'Password is too long.'
    else if (passwordScore(values.password) < 2) errors.password = 'Add uppercase, numbers or symbols.'
    if (values.confirm !== values.password) errors.confirm = 'Passwords do not match.'
    return errors
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError(null)

    const errors = validate()
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    setSubmitting(true)
    try {
      const { username } = await register({
        full_name: values.fullName.trim(),
        username: values.username,
        email: values.email.trim(),
        password: values.password,
      })
      onRegistered(username)
    } catch (error) {
      setFormError(error instanceof AuthError ? error.message : 'Something went wrong. Please try again.')
      setSubmitting(false)
    }
  }

  return (
    <>
      <header className="auth-heading">
        <h2>Create your account</h2>
        <p>Join IPHub to plan, manage and optimize IP space</p>
      </header>

      {formError && (
        <div className="alert alert-error" role="alert">
          <CircleAlert size={18} aria-hidden="true" />
          {formError}
        </div>
      )}

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <TextField
          id="fullName"
          label="Full name"
          icon={IdCard}
          value={values.fullName}
          onChange={set('fullName')}
          placeholder="e.g. Nimal Perera"
          autoComplete="name"
          error={fieldErrors.fullName}
          disabled={submitting}
        />
        <div className="field-pair">
          <TextField
            id="username"
            label="Username"
            icon={User}
            value={values.username}
            onChange={set('username')}
            placeholder="Choose a username"
            autoComplete="username"
            error={fieldErrors.username}
            disabled={submitting}
          />
          <TextField
            id="email"
            label="Email"
            icon={AtSign}
            type="email"
            value={values.email}
            onChange={set('email')}
            placeholder="you@company.com"
            autoComplete="email"
            error={fieldErrors.email}
            disabled={submitting}
          />
        </div>
        <div className="field-pair">
          <TextField
            id="password"
            label="Password"
            icon={Lock}
            type="password"
            value={values.password}
            onChange={set('password')}
            placeholder="Create a password"
            autoComplete="new-password"
            error={fieldErrors.password}
            disabled={submitting}
          />
          <TextField
            id="confirm"
            label="Confirm password"
            icon={LockKeyhole}
            type="password"
            value={values.confirm}
            onChange={set('confirm')}
            placeholder="Repeat password"
            autoComplete="new-password"
            error={fieldErrors.confirm}
            disabled={submitting}
          />
        </div>
        <PasswordStrength password={values.password} />

        <SubmitButton label="Create Account" busyLabel="Creating account…" busy={submitting} />
      </form>

      <p className="switch-prompt">
        Already have an account? <a href="#/login">Sign in</a>
      </p>
    </>
  )
}
