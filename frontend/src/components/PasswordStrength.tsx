const LEVELS = ['Too weak', 'Weak', 'Fair', 'Good', 'Strong'] as const

export function passwordScore(password: string): number {
  if (!password) return 0
  let score = 0
  if (password.length >= 8) score++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  return score
}

export default function PasswordStrength({ password }: { password: string }) {
  const score = passwordScore(password)
  return (
    <div className={`strength strength-${score}`} aria-live="polite">
      <div className="strength-bars" aria-hidden="true">
        {[1, 2, 3, 4].map((level) => (
          <span key={level} className={level <= score ? 'on' : ''} />
        ))}
      </div>
      <span className="strength-label">{password ? LEVELS[score] : 'Use 8+ characters with a mix of types'}</span>
    </div>
  )
}
