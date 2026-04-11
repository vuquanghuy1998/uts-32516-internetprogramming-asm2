import { useState, useCallback, useEffect } from 'react'

export function useStudySession(cards, shuffled = false) {
  // buildQueue is memoised so the useEffect below only fires when cards or
  // shuffled actually change, not on every render.
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

  const [queue, setQueue] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [stats, setStats] = useState({ easy: 0, hard: 0, missed: 0, totalRated: 0 })
  const [revisitCount, setRevisitCount] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [sessionDone, setSessionDone] = useState(false)

  // Rebuild the queue whenever the card list or shuffle preference changes.
  // This is the fix for the blank-study-screen bug: useState initialises only
  // once, so when StudyMode first renders the hook receives an empty array
  // (cards haven't loaded yet). This effect fires again once the real cards
  // arrive and rebuilds the queue correctly.
  useEffect(() => {
    setQueue(buildQueue())
    setCurrentIndex(0)
    setIsFlipped(false)
  }, [buildQueue])

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
      // Missed — reinsert immediately at the current position so it becomes
      // the next card seen.
      newQueue.splice(currentIndex, 1)
      newQueue.splice(currentIndex, 0, card)
      setRevisitCount(c => c + 1)
      setIsFlipped(false)
      setQueue(newQueue)
      return
    }

    setIsFlipped(false)

    if (newQueue.length === 0) {
      setSessionDone(true)
    } else if (currentIndex >= newQueue.length) {
      setCurrentIndex(newQueue.length - 1)
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
