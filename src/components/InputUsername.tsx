import { useState } from "react"
import { useUsername } from "../context/UsernameContext"

export default function InputUsername() {
  const [input, setInput] = useState("")
  const { setUsername } = useUsername()

  const saveUsername = () => {
    if (!input) return
    setUsername(input)
  }

  return (
    <div className="max-w-sm mx-auto p-6 border-2 border-gray-300 rounded-xl shadow-md text-center space-y-4">
      <h1 className="text-2xl font-bold text-white">Pick a username</h1>
      <div className="flex flex-row space-x-4">
        <input
          type="text"
          placeholder="Input username"
          onChange={(e) => setInput(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="button"
          onClick={saveUsername}
          className="py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
        >
          Save
        </button>
      </div>
    </div>
  )
}
