"use client"

import { useEffect, useState } from "react"
import { onPlayersUpdate, onLeaderboardUpdate } from "@/api/socket"

type Player = { id: string; username: string; wpm?: number; accuracy?: number }

export default function Leaderboard() {
  const [players, setPlayers] = useState<Player[]>([])

  useEffect(() => {
    onPlayersUpdate(setPlayers)
    onLeaderboardUpdate(setPlayers)
  }, [])

  return (
    <div className="border border-gray-300 rounded-md p-4 w-full max-w-md mx-auto text-black">
      <h2 className="text-lg font-semibold border-b pb-1">Leaderboard</h2>
      <ul className="">
        {players.map((p) => (
          <li key={p.id} className="flex justify-between border-b last:border-b-0 text-sm py-2">
            <span>{p.username}</span>
            <span>
              {p.wpm != null ? `${Math.round(p.wpm)} WPM` : "—"} |{" "}
              {p.accuracy != null ? `${Math.round(p.accuracy * 100)}%` : "—"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
