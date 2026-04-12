import { useState, useCallback, useEffect } from 'react'

// This custom hook manages all the logic for a single study session.
// It takes a list of cards and an optional flag for whether to shuffle them.
export function useStudySession(cards, shuffled = false) {

  // useCallback with buildQueu so the useEffect below is only triggered when cards or
  // shuffled actually change, not on every render.
  const buildQueue = useCallback(() => {
    const queue = [...cards]
    // This is the Fisher-Yates shuffle algorithm — a standard way to randomly
    // reorder an array. It works by walking backwards through the array and
    // swapping each element with a randomly chosen element before it.
    // This gives a truly random order (unlike sorting by Math.random()).
    if (shuffled) {
      for (let i = queue.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [queue[i], queue[j]] = [queue[j], queue[i]]
      }
    }
    return queue
  }, [cards, shuffled])

  // --- State variables that track the current state of the study session ---
  const [queue, setQueue] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [stats, setStats] = useState({ easy: 0, hard: 0, missed: 0, totalRated: 0 })
  const [revisitCount, setRevisitCount] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [sessionDone, setSessionDone] = useState(false)

  // Rebuild the queue whenever the card list or shuffle preference changes.
  // This is the fix for the blank-study-screen bug: useState initialises only
  // once, so when StudyMode first renders the hook receives an empty array
  // (cards haven't loaded yet). This effect is triggered again once the real cards
  // arrive and rebuilds the queue correctly.
  useEffect(() => {
    setQueue(buildQueue())
    setCurrentIndex(0)
    setIsFlipped(false)
  }, [buildQueue])

  // --- Derived values (calculated from current state, not stored separately) ---
  const currentCard = queue[currentIndex] ?? null
  const remaining = queue.length - currentIndex
  const accuracy = stats.totalRated > 0
    ? Math.round((stats.easy / stats.totalRated) * 100)
    : 0

  // Flip the card between question and answer side    
  const flip = () => setIsFlipped(f => !f)
  
  // This is the core logic of the study session — what happens when a user
  // rates a card as 'easy', 'hard', or 'missed'.
  const rate = useCallback((rating) => {
    // Work on a copy of the queue so we can safely mutate it before setting state
    const newQueue = [...queue]
    const card = newQueue[currentIndex]

    // Update the stats counter for whichever rating was chosen
    setStats(prev => ({
      ...prev,
      [rating]: prev[rating] + 1,
      totalRated: prev.totalRated + 1,
    }))

    if (rating === 'easy') {
      // Easy: card is done, remove it from the queue entirely
      newQueue.splice(currentIndex, 1)

    } else if (rating === 'hard') {
      // Hard: remove the card from its current position, then re-insert it
      // 3 positions ahead so the user sees it again soon but not immediately.
      // Math.min ensures we don't try to insert past the end of the array.
      newQueue.splice(currentIndex, 1)
      const insertAt = Math.min(currentIndex + 3, newQueue.length)
      newQueue.splice(insertAt, 0, card)
      if (insertAt <= currentIndex) setRevisitCount(c => c + 1)
    } else {
      // Missed: the card is removed and immediately re-inserted at the same
      // position, making it the very next card the user sees.
      // We also reset the flip so they see the question side again.
      newQueue.splice(currentIndex, 1)
      newQueue.splice(currentIndex, 0, card)
      setRevisitCount(c => c + 1)
      setIsFlipped(false)
      setQueue(newQueue)
      return
    }

    setIsFlipped(false) // Always unflip the card when moving to the next one

    if (newQueue.length === 0) {
      // No cards left — the session is complete
      setSessionDone(true)
    } else if (currentIndex >= newQueue.length) {
      // This prevents an "out of bounds" crash if we were on the last card
      // and it just got removed — move the index back to the new last card.
      setCurrentIndex(newQueue.length - 1)
    }

    setQueue(newQueue)
  }, [queue, currentIndex])

  const endSession = () => setSessionDone(true) // Manually end the session early (e.g. user clicks "Finish")

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
