import { useState, useEffect } from 'react'
import AuthPage from './AuthPage'
import ApexNeuraApp from './ApexNeuraApp'

export default function App() {
  const [user,  setUser]  = useState(null)
  const [token, setToken] = useState(null)

  // Check if already logged in
  useEffect(() => {
    const savedToken = localStorage.getItem("apexneura_token")
    const savedUser  = localStorage.getItem("apexneura_user")
    if (savedToken && savedUser) {
      setToken(savedToken)
      setUser(JSON.parse(savedUser))
    }
  }, [])

  const handleLogin = (userData, accessToken) => {
    setUser(userData)
    setToken(accessToken)
  }

  const handleLogout = () => {
    localStorage.removeItem("apexneura_token")
    localStorage.removeItem("apexneura_user")
    setUser(null)
    setToken(null)
  }

  if (!user) {
    return <AuthPage onLogin={handleLogin} />
  }

  return <ApexNeuraApp user={user} token={token} onLogout={handleLogout} />
}