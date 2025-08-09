import sentences from "./sentences.json"

export const randomSentence = () => {
  const index = Math.floor(Math.random() * sentences.length)
  return sentences[index]
}
