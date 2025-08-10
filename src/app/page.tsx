"use client"

import TypingField from "@/components/TypingField"
import InputUsername from "../components/InputUsername"
import { useUsername } from "../context/UsernameContext"

export default function Home() {
  const { username } = useUsername()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      {username ? (
        <div className="w-full max-w-3xl space-y-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800">Hello {username}!</h1>
          <TypingField />
        </div>
      ) : (
        <InputUsername />
      )}
    </div>
  )
}
