"use client"

import InputUsername from "../components/InputUsername"
import { useUsername } from "../context/UsernameContext"
import { randomSentence } from "@/lib/sentences"

export default function Home() {
  const { username } = useUsername()

  return (
    <div>
      {username ? <h1>Hello {username}!</h1> : <InputUsername />}
      <p>{randomSentence()}</p>
    </div>
  )
}
