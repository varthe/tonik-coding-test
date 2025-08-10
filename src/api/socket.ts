import { io } from "socket.io-client"

export const socket = io("http://localhost:3001", {
  transports: ["websocket"],
})

export const emitUserJoin = (username: string) => {
  socket.emit("join", username)
}

export const onPlayersUpdate = (cb: (players: any[]) => void) => {
  socket.off("players")
  socket.on("players", cb)
}

export const onLeaderboardUpdate = (cb: (players: any[]) => void) => {
  socket.off("leaderboard")
  socket.on("leaderboard", cb)
}
