"use client"

import { createContext, useContext, useEffect, useState } from "react"

type UsernameContextType = {
  username: string | null
  setUsername: (name: string) => void
}

const UsernameContext = createContext<UsernameContextType | undefined>(undefined)

export function UsernameProvider({ children }: { children: React.ReactNode }) {
  const [username, setUsernameState] = useState<string | null>(null)

  useEffect(() => {
    const stored = sessionStorage.getItem("username")
    if (stored) setUsernameState(stored)
  }, [])

  const setUsername = (name: string) => {
    setUsernameState(name)
    sessionStorage.setItem("username", name)
  }

  return <UsernameContext.Provider value={{ username, setUsername }}>{children}</UsernameContext.Provider>
}

export function useUsername() {
  const ctx = useContext(UsernameContext)
  if (!ctx) throw new Error("useUsername must be used inside UsernameProvider")
  return ctx
}
