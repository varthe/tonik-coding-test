import { Server } from "socket.io"
import * as http from "http"

type Player = {
  id: string
  username: string
  progress: string
  wpm?: number
  accuracy?: number
  finished: boolean
}

const server = http.createServer()
const io = new Server(server, { cors: { origin: "*" } })

let players: Record<string, Player> = {}
let currentSentence = ""
let roundActive = false
let startTime = 0

io.on("connection", (socket) => {
  socket.on("join", (username) => {
    console.log(`Player ${username} joined the game`)
    players[socket.id] = { id: socket.id, username, progress: "", finished: false }
    io.emit("players", Object.values(players))
  })

  socket.on("progress", (text) => {
    if (players[socket.id] && roundActive) {
      players[socket.id].progress = text
      io.emit("leaderboard", Object.values(players))
    }
  })

  socket.on("finish", ({ correctChars, totalChars }) => {
    const minutes = (Date.now() - startTime) / 60000
    const wpm = correctChars / 5 / minutes
    const accuracy = correctChars / totalChars
    players[socket.id] = { ...players[socket.id], wpm, accuracy, finished: true }
    io.emit("leaderboard", Object.values(players))
  })

  socket.on("disconnect", () => {
    delete players[socket.id]
    io.emit("players", Object.values(players))
  })
})

const startRound = (sentence: string) => {
  currentSentence = sentence
  roundActive = true
  startTime = Date.now()
  for (const id in players) {
    players[id] = { ...players[id], progress: "", finished: false, wpm: undefined, accuracy: undefined }
  }
  io.emit("startRound", { sentence, startTime })
}

server.listen(3001, () => console.log("Server listening on 3001"))
