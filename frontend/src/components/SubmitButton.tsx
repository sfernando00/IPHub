import { ArrowRight, Loader2 } from 'lucide-react'

interface SubmitButtonProps {
  label: string
  busyLabel: string
  busy: boolean
}

export default function SubmitButton({ label, busyLabel, busy }: SubmitButtonProps) {
  return (
    <button type="submit" className="btn-primary" disabled={busy}>
      {busy ? (
        <>
          <Loader2 className="spin" size={20} aria-hidden="true" />
          {busyLabel}
        </>
      ) : (
        <>
          {label}
          <span className="btn-arrow" aria-hidden="true">
            <ArrowRight size={16} strokeWidth={2.5} />
          </span>
        </>
      )}
    </button>
  )
}
