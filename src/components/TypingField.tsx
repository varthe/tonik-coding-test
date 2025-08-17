"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { emitFinish, emitProgress, onBreak, onRoundEnd, onRoundStart } from "@/api/socket"

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n))

export default function TypingField() {
  const [sentence, setSentence] = useState("")
  const sentenceArr = useMemo(() => (sentence ? sentence.split(" ") : []), [sentence])

  const [input, setInput] = useState("")
  const [showError, setShowError] = useState(false)
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const currentWord = sentenceArr[currentWordIndex] ?? ""

  const [roundActive, setRoundActive] = useState(false)
  const [startTime, setStartTime] = useState(0)
  const [durationMs, setDurationMs] = useState(0)
  const [remaining, setRemaining] = useState(0)
  const [breakRemaining, setBreakRemaining] = useState(0)

  const failedRef = useRef(0)
  const finishedRef = useRef(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const typedSentence = useMemo(() => {
    if (!sentence) {
      return ""
    }
    const typedWords = currentWordIndex > 0 ? sentenceArr.slice(0, currentWordIndex).join(" ") : ""
    const currentInput = input.trim()
    if (!typedWords) {
      return currentInput
    }
    return currentInput ? `${typedWords} ${currentInput}` : `${typedWords} `
  }, [sentence, sentenceArr, currentWordIndex, input])

  useEffect(() => {
    onRoundStart(({ sentence, startTime, durationMs }) => {
      setSentence(sentence)
      setStartTime(startTime)
      setDurationMs(durationMs)
      setRemaining(durationMs)
      setRoundActive(true)
      setInput("")
      setShowError(false)
      setCurrentWordIndex(0)
      failedRef.current = 0
      finishedRef.current = false
      setBreakRemaining(0)
      inputRef.current?.focus()
    })
    onRoundEnd(() => {
      setRoundActive(false)
      setRemaining(0)
    })
    onBreak(({ breakMs, breakStart }) => {
      const tick = () => {
        const left = breakMs - (Date.now() - breakStart)
        setBreakRemaining(clamp(left, 0, breakMs))
      }
      tick()
      const i = setInterval(tick, 200)
      setTimeout(() => clearInterval(i), breakMs + 50)
    })
  }, [])

  useEffect(() => {
    if (!roundActive) {
      return
    }
    const i = setInterval(() => {
      const left = durationMs - (Date.now() - startTime)
      setRemaining(clamp(left, 0, durationMs))
      if (left <= 0 && !finishedRef.current) {
        const correct = correctCharacterCount(typedSentence, sentence)
        emitFinish({ correctChars: correct, failedKeystrokes: failedRef.current, finished: false })
        finishedRef.current = true
      }
    }, 200)
    return () => clearInterval(i)
  }, [roundActive, durationMs, startTime, typedSentence, sentence])

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!roundActive || finishedRef.current) {
      return
    }
    const value = e.target.value
    const trimmed = value.trim()

    if (value.endsWith(" ") && trimmed !== currentWord) {
      failedRef.current += 1
      setShowError(true)
      return
    }

    if (!currentWord.startsWith(trimmed)) {
      failedRef.current += 1
      setShowError(true)
      return
    }

    setShowError(false)
    setInput(value)

    if (value.endsWith(" ") && trimmed === currentWord) {
      if (currentWordIndex === sentenceArr.length - 1) {
        const total = sentence.length
        emitFinish({ correctChars: total, failedKeystrokes: failedRef.current, finished: true })
        finishedRef.current = true
        return
      }
      setCurrentWordIndex(currentWordIndex + 1)
      setInput("")
      return
    }

    if (!finishedRef.current) {
      emitProgress({ text: typedSentence, failed: failedRef.current })
    }
  }

  const ghostText = () => {
    const trimmedInput = input.trim()
    let ghostText = ""
    if (currentWord && currentWord.startsWith(trimmedInput)) {
      ghostText = currentWord.slice(trimmedInput.length)
    }
    return ghostText
  }

  return (
    <div className="space-y-4 flex flex-col items-center">
      <p className="text-gray-700 text-xl min-h-[1.75rem]">{sentence}</p>
      <div
        className={`relative w-full max-w-lg rounded-lg border-2 px-4 py-2 font-mono text-lg ${
          showError ? "border-red-500 bg-red-50" : roundActive ? "border-gray-300 bg-white" : "border-gray-200 bg-gray-100"
        }`}
      >
        <div className="absolute inset-0 flex items-center px-4 py-2 font-mono text-lg">
          <span className="text-gray-900">{input}</span>
          <span className="text-gray-400 select-none">{ghostText()}</span>
        </div>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={onInputChange}
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck={false}
          disabled={!roundActive || finishedRef.current}
          className="relative z-10 w-full bg-transparent text-transparent caret-blue-600 outline-none"
        />
      </div>
      <p className="text-sm text-gray-600 h-5">
        {roundActive ? Math.ceil(remaining / 1000) : breakRemaining > 0 ? `Next round in ${Math.ceil(breakRemaining / 1000)}` : ""}
      </p>
    </div>
  )
}

const correctCharacterCount = (typedSentence: string, sentence: string) => {
  const shortestLength = Math.min(typedSentence.length, sentence.length)
  let correctCount = 0
  for (let i = 0; i < shortestLength; i++) {
    if (typedSentence[i] === sentence[i]) {
      correctCount++
    }
  }
  return correctCount
}
