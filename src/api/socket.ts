import { io } from "socket.io-client"

const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:3001", { autoConnect: true })

export const joinGame = (username: string) => socket.emit("join", username)
export const onPlayersUpdate = (cb: (players: any[]) => void) => socket.on("players", cb)
export const onLeaderboardUpdate = (cb: (players: any[]) => void) => socket.on("leaderboard", cb)

export const onRoundStart = (cb: (data: { sentence: string; startTime: number; durationMs: number; breakMs: number }) => void) =>
  socket.on("startRound", cb)

export const onRoundEnd = (cb: () => void) => socket.on("endRound", cb)
export const onBreak = (cb: (data: { breakMs: number; breakStart: number }) => void) => socket.on("break", cb)

export const emitProgress = (payload: { text: string; failed: number }) => socket.emit("progress", payload)
export const emitFinish = (payload: { correctChars: number; failedKeystrokes: number; finished: boolean }) => socket.emit("finish", payload)
