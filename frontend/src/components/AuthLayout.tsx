import type { ReactNode } from 'react'
import { CircleHelp, Mail } from 'lucide-react'
import logo from '../assets/iphub-logo.png'
import BrandPanel from './BrandPanel.tsx'

export type AuthRoute = 'login' | 'register'

interface AuthLayoutProps {
  route: AuthRoute
  children: ReactNode
}

export default function AuthLayout({ route, children }: AuthLayoutProps) {
  return (
    <div className="auth-shell">
      <BrandPanel />

      <main className="form-side">
        <nav className="top-links" aria-label="Support">
          <a href="#help">
            <CircleHelp size={16} aria-hidden="true" />
            Help
          </a>
          <a href="#contact">
            <Mail size={16} aria-hidden="true" />
            Contact Us
          </a>
        </nav>

        <div className="mobile-brand">
          <img src={logo} alt="" width={40} height={40} />
          <div>
            <p className="brand-name">IPHub</p>
            <p className="brand-slogan">Where Every IP Finds Its Place.</p>
          </div>
        </div>

        <section className="auth-card">
          <nav className={`auth-tabs ${route === 'register' ? 'is-register' : ''}`} aria-label="Account">
            <span className="auth-tabs-indicator" aria-hidden="true" />
            <a href="#/login" aria-current={route === 'login' ? 'page' : undefined}>
              Sign In
            </a>
            <a href="#/register" aria-current={route === 'register' ? 'page' : undefined}>
              Register
            </a>
          </nav>
          <div key={route} className="auth-view">
            {children}
          </div>
        </section>
      </main>
    </div>
  )
}
