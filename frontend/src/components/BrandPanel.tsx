import { BarChart3, Database, Settings, ShieldCheck } from 'lucide-react'
import logo from '../assets/iphub-logo.png'
import NetworkCanvas from './NetworkCanvas.tsx'

const features = [
  { icon: ShieldCheck, label: 'Secure' },
  { icon: Database, label: 'Centralized' },
  { icon: Settings, label: 'Efficient' },
  { icon: BarChart3, label: 'Better Planning' },
]

export default function BrandPanel() {
  return (
    <aside className="brand">
      <span className="aurora aurora-one" aria-hidden="true" />
      <span className="aurora aurora-two" aria-hidden="true" />
      <NetworkCanvas />

      <div className="brand-content">
        <header className="brand-identity">
          <img src={logo} alt="" width={64} height={64} />
          <div>
            <p className="brand-name">
              IP<span className="brand-name-hub">Hub</span>
            </p>
            <p className="brand-slogan">Where Every IP Finds Its Place.</p>
          </div>
        </header>

        <section className="brand-hero">
          <p className="eyebrow">
            <span className="eyebrow-dot" aria-hidden="true" />
            Plan · Manage · Optimize
          </p>
          <h1 className="hero-title">
            <span className="ims" data-text="IMS">
              IMS
            </span>
            <span className="ims-full">
              IP Management <span className="accent">System</span>
            </span>
          </h1>
          <p className="brand-tagline">Reliable networks for a connected tomorrow.</p>
        </section>

        <footer className="brand-footer">
          <ul className="features">
            {features.map(({ icon: Icon, label }) => (
              <li key={label}>
                <span className="feature-icon">
                  <Icon size={18} strokeWidth={2} aria-hidden="true" />
                </span>
                {label}
              </li>
            ))}
          </ul>
          <p className="copyright">© {new Date().getFullYear()} IPHub. All rights reserved.</p>
        </footer>
      </div>
    </aside>
  )
}
