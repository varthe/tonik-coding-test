import { Server } from "socket.io"
import * as http from "http"
import sentences from "./sentences.json"

type Player = {
  id: string
  username: string
  progress: string
  wpm?: number
  accuracy?: number
  finished: boolean
  failedKeystrokes: number
}

const randomSentence = () => {
  const index = Math.floor(Math.random() * sentences.length)
  return sentences[index]
}

const server = http.createServer()
const io = new Server(server, { cors: { origin: "*" } })

let players: Record<string, Player> = {}
let currentSentence = ""
let roundActive = false
let startTime = 0
let roundTimeout: NodeJS.Timeout | null = null
let breakTimeout: NodeJS.Timeout | null = null

const calculateStats = (correctCount: number, failedCount: number) => {
  // Formulas taken from https://www.speedtypingonline.com/typing-equations
  const minutes = (Date.now() - startTime) / 60000
  const wpm = correctCount / 5 / minutes
  const accuracy = correctCount / (correctCount + failedCount)
  return { wpm, accuracy }
}

const emitLeaderboard = () => {
  io.emit("leaderboard", Object.values(players))
}

const endRound = () => {
  for (const id in players) {
    const p = players[id]
    if (!p.finished) {
      let correctCount = 0
      for (let i = 0; i < p.progress.length; i++) {
        if (p.progress[i] === currentSentence[i]) {
          correctCount++
        }
      }
      const { wpm, accuracy } = calculateStats(correctCount, p.failedKeystrokes)
      players[id] = { ...p, wpm, accuracy, finished: false }
    }
  }

  emitLeaderboard()
  io.emit("endRound")
  roundActive = false
  startTime = 0

  const breakStart = Date.now()
  io.emit("break", { breakMs: 10000, breakStart })

  if (breakTimeout) clearTimeout(breakTimeout)
  breakTimeout = setTimeout(startRound, 10000)
}

const startRound = () => {
  if (Object.keys(players).length === 0 || roundActive) {
    return
  }

  roundActive = true
  currentSentence = randomSentence()
  startTime = Date.now()

  for (const id in players) {
    players[id] = { ...players[id], progress: "", finished: false, wpm: undefined, accuracy: undefined, failedKeystrokes: 0 }
  }
  io.emit("startRound", { sentence: currentSentence, startTime, durationMs: 20000, breakMs: 10000 })

  if (roundTimeout) {
    clearTimeout(roundTimeout)
  }
  roundTimeout = setTimeout(endRound, 20_000)
}

io.on("connection", (socket) => {
  socket.on("join", (username) => {
    players[socket.id] = { id: socket.id, username, progress: "", finished: false, failedKeystrokes: 0 }
    io.emit("players", Object.values(players))
    startRound()
  })

  socket.on("progress", ({ text, failed }: { text: string; failed: number }) => {
    if (!roundActive || !players[socket.id]) {
      return
    }

    players[socket.id].progress = text
    players[socket.id].failedKeystrokes = failed
    emitLeaderboard()
  })

  socket.on(
    "finish",
    ({ correctChars, failedKeystrokes, finished }: { correctChars: number; failedKeystrokes: number; finished: boolean }) => {
      if (!players[socket.id] || !roundActive) {
        return
      }

      const { wpm, accuracy } = calculateStats(correctChars, failedKeystrokes)
      players[socket.id] = { ...players[socket.id], wpm, accuracy, finished, failedKeystrokes }
      emitLeaderboard()
    }
  )

  socket.on("disconnect", () => {
    delete players[socket.id]
    io.emit("players", Object.values(players))
  })
})

server.listen(3001, () => console.log("Server listening on 3001"))
