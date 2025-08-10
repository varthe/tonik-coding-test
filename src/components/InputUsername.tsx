import { useState } from "react"
import { useUsername } from "../context/UsernameContext"
import { emitUserJoin } from "@/api/socket"

export default function InputUsername() {
  const [input, setInput] = useState("")
  const [errors, setErrors] = useState<string[]>([])
  const { setUsername } = useUsername()

  const USERNAME_REGEX = /^[\p{L}\p{N} _-]+$/u

  const saveUsername = () => {
    const errorList = []
    if (!input) {
      errorList.push("Username must not be empty")
    }
    if (input.length < 3 || input.length > 20) {
      errorList.push("Username must be between 3 and 20 characters long")
    }
    if (!USERNAME_REGEX.test(input)) {
      errorList.push("Username must not contain special characters")
    }

    if (errorList.length > 0) {
      setErrors(errorList)
      return
    }

    setErrors([])
    setUsername(input)
    emitUserJoin(input)
  }

  return (
    <div className="max-w-sm mx-auto p-6 border-2 border-gray-300 rounded-xl shadow-md text-center space-y-4">
      <h1 className="text-2xl font-bold text-black">Pick your username</h1>
      <div className="flex flex-row space-x-4">
        <input
          type="text"
          placeholder="Input username"
          onChange={(e) => setInput(e.target.value)}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.length > 0 ? "border-red-400" : "border-gray-300"
          }`}
        />
        <button
          type="button"
          onClick={saveUsername}
          className="py-2 px-4 bg-blue-600 font-semibold rounded-lg hover:bg-blue-700 transition-colors"
        >
          Save
        </button>
      </div>
      {errors.length > 0 && (
        <div className="mt-4 rounded-md border border-red-400 bg-red-50 p-3">
          <h2 className="mb-2 font-semibold text-red-700 ">Errors:</h2>
          <ul className="list-disc list-inside text-red-600">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
