"use client"

import { useState } from "react"
import LoginPage from "@/components/login-page"
import Dashboard from "@/components/dashboard"

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userName, setUserName] = useState("")

  const handleLogin = (name: string) => {
    setUserName(name)
    setIsLoggedIn(true)
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setUserName("")
  }

  return (
    <main className="min-h-screen bg-background">
      {isLoggedIn ? <Dashboard userName={userName} onLogout={handleLogout} /> : <LoginPage onLogin={handleLogin} />}
    </main>
  )
}
