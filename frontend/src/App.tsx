import { useEffect, useState } from 'react'
import AuthLayout, { type AuthRoute } from './components/AuthLayout.tsx'
import LoginPage from './pages/LoginPage.tsx'
import RegisterPage from './pages/RegisterPage.tsx'
import './styles/auth.css'

const readRoute = (): AuthRoute => (window.location.hash === '#/register' ? 'register' : 'login')

export default function App() {
  const [route, setRoute] = useState<AuthRoute>(readRoute)
  const [registeredUsername, setRegisteredUsername] = useState<string>()

  useEffect(() => {
    const onHashChange = () => {
      const next = readRoute()
      if (next === 'register') setRegisteredUsername(undefined)
      setRoute(next)
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  useEffect(() => {
    document.title = route === 'register' ? 'IPHub · Register' : 'IPHub · Sign In'
  }, [route])

  function handleRegistered(username: string) {
    setRegisteredUsername(username)
    window.location.hash = '#/login'
  }

  return (
    <AuthLayout route={route}>
      {route === 'register' ? (
        <RegisterPage onRegistered={handleRegistered} />
      ) : (
        <LoginPage registeredUsername={registeredUsername} />
      )}
    </AuthLayout>
  )
}
