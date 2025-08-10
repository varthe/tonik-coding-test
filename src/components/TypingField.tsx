"use client"

import { randomSentence } from "@/lib/sentences"
import { useMemo, useRef, useState } from "react"

export default function TypingField() {
  const [sentence] = useState(() => randomSentence())
  const sentenceArr = useMemo(() => sentence.split(" "), [sentence])

  const [input, setInput] = useState("")
  const [showError, setShowError] = useState(false)
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const currentWord = sentenceArr[currentWordIndex]

  const startTime = useRef<number>(performance.now())
  const endTimes = useRef<number[]>([])

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value

    if (!currentWord.startsWith(value.trim())) {
      setShowError(true)
      return
    }

    setShowError(false)
    setInput(value)

    if (value.endsWith(" ") && value.trim() === currentWord) {
      const endTime = performance.now()
      const timeTaken = endTime - startTime.current
      console.log(`Time taken for word ${currentWord}: ${timeTaken}`)

      endTimes.current.push(timeTaken)

      setCurrentWordIndex(currentWordIndex + 1)
      setInput("")
      startTime.current = performance.now()
    }
  }

  const ghostText = currentWord && currentWord.startsWith(input.trim()) ? currentWord.slice(input.trim().length) : ""

  return (
    <div className="space-y-4 flex flex-col items-center">
      <p className="text-gray-700 text-xl">{sentence}</p>

      <div
        className={`relative w-full max-w-lg rounded-lg border-2 px-4 py-2 font-mono text-lg ${
          showError ? "border-red-500 bg-red-50" : "border-gray-300 bg-white"
        }`}
      >
        {/* Background layer with typed and ghost text */}
        <div className="absolute inset-0 flex items-center px-4 py-2 font-mono text-lg">
          <span className="text-gray-900">{input}</span>
          <span className="text-gray-400 select-none">{ghostText}</span>
        </div>

        {/* Transparent input — caret aligns with typed text width */}
        <input
          type="text"
          value={input}
          onChange={onInputChange}
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck={false}
          className="relative z-10 w-full bg-transparent text-transparent caret-blue-600 outline-none"
        />
      </div>
    </div>
  )
}
