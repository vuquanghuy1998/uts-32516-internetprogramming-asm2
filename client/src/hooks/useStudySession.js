import { useState, useCallback } from 'react'

export function useStudySession(cards, shuffled = false) {
  const buildQueue = useCallback(() => {
    const queue = [...cards]
    if (shuffled) {
      for (let i = queue.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [queue[i], queue[j]] = [queue[j], queue[i]]
      }
    }
    return queue
  }, [cards, shuffled])

  const [queue, setQueue] = useState(() => buildQueue())
  const [currentIndex, setCurrentIndex] = useState(0)
  const [stats, setStats] = useState({ easy: 0, hard: 0, missed: 0, totalRated: 0 })
  const [revisitCount, setRevisitCount] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [sessionDone, setSessionDone] = useState(false)

  const currentCard = queue[currentIndex] ?? null
  const remaining = queue.length - currentIndex
  const accuracy = stats.totalRated > 0
    ? Math.round((stats.easy / stats.totalRated) * 100)
    : 0

  const flip = () => setIsFlipped(f => !f)

  const rate = useCallback((rating) => {
    const newQueue = [...queue]
    const card = newQueue[currentIndex]

    setStats(prev => ({
      ...prev,
      [rating]: prev[rating] + 1,
      totalRated: prev.totalRated + 1,
    }))

    if (rating === 'easy') {
      newQueue.splice(currentIndex, 1)
    } else if (rating === 'hard') {
      newQueue.splice(currentIndex, 1)
      const insertAt = Math.min(currentIndex + 3, newQueue.length)
      newQueue.splice(insertAt, 0, card)
      if (insertAt <= currentIndex) setRevisitCount(c => c + 1)
    } else {
      // missed — reinsert immediately after current
      newQueue.splice(currentIndex, 1)
      newQueue.splice(currentIndex, 0, card)
      setRevisitCount(c => c + 1)
      // advance past to the reinserted card (it's now at currentIndex)
      setIsFlipped(false)
      setQueue(newQueue)
      return
    }

    setIsFlipped(false)

    if (currentIndex >= newQueue.length) {
      if (newQueue.length === 0) {
        setSessionDone(true)
      } else {
        setCurrentIndex(newQueue.length - 1)
      }
    }

    setQueue(newQueue)
  }, [queue, currentIndex])

  const endSession = () => setSessionDone(true)

  const reset = () => {
    setQueue(buildQueue())
    setCurrentIndex(0)
    setStats({ easy: 0, hard: 0, missed: 0, totalRated: 0 })
    setRevisitCount(0)
    setIsFlipped(false)
    setSessionDone(false)
  }

  return {
    currentCard,
    queue,
    remaining,
    stats,
    accuracy,
    revisitCount,
    isFlipped,
    sessionDone,
    flip,
    rate,
    endSession,
    reset,
  }
}
