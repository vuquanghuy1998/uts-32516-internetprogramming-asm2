// StudyMode.jsx

// This file creates an interactive flashcard study session for a single deck. The page
// has three sequential screens: a pre-session setup screen (shuffle toggle button +
// start button), the active study screen (live stats dashboard, flippable card,
// and rating buttons), and a post-session summary screen (final stats + save).
//
// Session queue logic lives entirely in useStudySession — this file only
// renders its output and routes user actions (flip, rate, end) back into it.
// Keyboard shortcuts (Space, 1/2/3, Escape) are registered globally while a
// session is active and cleaned up on unmount via the useEffect return value.
// Stats are persisted to the database only when the user explicitly clicks
// "Save & Exit"; clicking "Exit Without Saving" skips the API call and no data
// is written permanently to the database.

import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getCards } from '../services/cardService'
import { saveSession } from '../services/sessionService'
import { useStudySession } from '../hooks/useStudySession'
import CardFlip from '../components/CardFlip/CardFlip'
import { showToast } from '../components/Toast/Toast'

// Stable reference for the empty-cards state before the session starts.
// A plain `[]` literal would be a new reference every render, causing
// buildQueue to recreate every render → infinite re-render loop.
const EMPTY_CARDS = []

export default function StudyMode() {
  const { deckId } = useParams()
  const navigate = useNavigate()
  const [cards, setCards] = useState([])

  // Whether the user has opted to randomise card order before starting.
  const [shuffled, setShuffled] = useState(false)

  // Gates which screen is shown. False = display the pre-session setup screen.
  const [started, setStarted] = useState(false)

  // This state helps prevents double-submission while the save API call is in-flight.
  const [saving, setSaving] = useState(false)

  useEffect(() => { document.title = 'Study Session — Cardie' }, [])

  // Fetch all cards for this deck so their count can be shown on the setup
  // screen and the session queue can be built when the user starts.
  useEffect(() => {
    getCards(deckId).then(setCards).catch(() => showToast('Failed to load cards', 'error'))
  }, [deckId])

  // Pass an empty array before the session starts so the hook initialises
  // with no queue. EMPTY_CARDS is stable so buildQueue's dependency doesn't
  // change on every render (which would cause an infinite re-render loop).
  const session = useStudySession(started ? cards : EMPTY_CARDS, shuffled)

  // useCallback memoises the handler so the keydown useEffect below only
  // re-registers the listener when the session state actually changes.
  const handleKey = useCallback((e) => {
    // Ignore all keypresses until the session is active and not yet finished.
    if (!started || session.sessionDone) return
    if (e.key === ' ') {
      e.preventDefault() // Prevent the page from scrolling on Spacebar.
      session.flip()
    }
    // Rating shortcuts are only active after the card has been flipped to show
    // the answer — prevents accidental ratings before seeing the answer.
    if (e.key === '1' && session.isFlipped) session.rate('missed')
    if (e.key === '2' && session.isFlipped) session.rate('hard')
    if (e.key === '3' && session.isFlipped) session.rate('easy')
    if (e.key === 'Escape') session.endSession()
  }, [started, session])

  // Register and clean up the global keydown listener whenever the memoised
  // handler reference changes (i.e. whenever session state changes).
  useEffect(() => {
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [handleKey])

  const handleEndSession = async () => {
    session.endSession()
  }

  const handleSaveAndExit = async () => {
    setSaving(true)
    try {
      // Re-calculate accuracy here rather than relying on session.accuracy so the
      // value saved to the DB matches the final accuracy stats at the moment of saving.
      const accuracy = session.stats.totalRated > 0
        ? Math.round((session.stats.easy / session.stats.totalRated) * 100)
        : 0
      await saveSession({
        deck_id: Number(deckId),
        easy_count: session.stats.easy,
        hard_count: session.stats.hard,
        missed_count: session.stats.missed,
        total_cards: session.stats.totalRated,
        accuracy_percent: accuracy,
        // Send the remaining queue so the backend can increment per-card
        // ease/hard/missed counters on the flashcards table.
        card_ratings: session.queue,
      })
      showToast('Session saved!')
    } catch {
      showToast('Failed to save session', 'error')
    } finally {
      // Always navigate back to the deck page, even if the save failed,
      // so the user is never stuck on the summary screen.
      setSaving(false)
      navigate(`/decks/${deckId}`)
    }
  }

  // ── Screen 1: Pre-session setup ─────────────────────────────────────────────
  if (!started) {
    return (
      <div className="study-start">
        <h1>Ready to study?</h1>
        <p>{cards.length} cards in this deck</p>
        <label className="shuffle-toggle">
          <input type="checkbox" checked={shuffled} onChange={e => setShuffled(e.target.checked)} />
          Shuffle cards
        </label>
        {/* Disabled until cards have loaded so the session doesn't start with
            an empty queue. */}
        <button className="btn btn-primary btn-lg" onClick={() => setStarted(true)} disabled={cards.length === 0}>
          Start Session
        </button>
        <button className="btn btn-secondary" onClick={() => navigate(`/decks/${deckId}`)}>Back</button>
      </div>
    )
  }

  // ── Screen 3: Post-session summary ──────────────────────────────────────────
  // Rendered as soon as sessionDone becomes true (queue emptied or user ended
  // the session early). Shown before Screen 2 in the code so it takes priority
  // over the active study view once the session is done.
  if (session.sessionDone) {
    return (
      <div className="study-summary">
        <h1>Session Complete!</h1>
        <div className="summary-stats">
          <div className="stat-item">✅ Easy: {session.stats.easy}</div>
          <div className="stat-item">😰 Hard: {session.stats.hard}</div>
          <div className="stat-item">❌ Missed: {session.stats.missed}</div>
          <div className="stat-item">📈 Accuracy: {session.accuracy}%</div>
        </div>
        {/* Disable the button while the save is in-flight to prevent double-submission. */}
        <button className="btn btn-primary" onClick={handleSaveAndExit} disabled={saving}>
          {saving ? 'Saving…' : 'Save & Exit'}
        </button>
        <button className="btn btn-secondary" onClick={() => navigate(`/decks/${deckId}`)}>Exit Without Saving</button>
      </div>
    )
  }

  // ── Screen 2: Active study session ──────────────────────────────────────────
  return (
    <div className="study-mode">
      {/* Live stats bar — always visible during the session so the user can
          track progress without interrupting their flow. */}
      <div className="study-dashboard">
        <span title="Easy">✅ {session.stats.easy}</span>
        <span title="Hard">😰 {session.stats.hard}</span>
        <span title="Missed">❌ {session.stats.missed}</span>
        <span title="Accuracy">📈 {session.accuracy}%</span>
        <span title="Remaining">🃏 {session.remaining}</span>
        {/* How many times any card has looped back into the queue. */}
        <span title="Revisits">🔁 {session.revisitCount}</span>
        <button className="btn btn-secondary btn-sm" onClick={handleEndSession}>End</button>
      </div>

      {/* Render the flippable card for the current queue position. Also prevents
          undefined value in case the queue transitions to empty between renders. */}
      {session.currentCard && (
        <CardFlip card={session.currentCard} isFlipped={session.isFlipped} onFlip={session.flip} />
      )}

      {/* Rating buttons appear only after the card has been flipped to show the
          answer to ensure correct stats. */}
      {session.isFlipped && (
        <div className="rating-buttons">
          <button className="btn btn-missed" onClick={() => session.rate('missed')}>
            ❌ Missed <kbd>1</kbd>
          </button>
          <button className="btn btn-hard" onClick={() => session.rate('hard')}>
            😰 Hard <kbd>2</kbd>
          </button>
          <button className="btn btn-easy" onClick={() => session.rate('easy')}>
            ✅ Easy <kbd>3</kbd>
          </button>
        </div>
      )}

      {/* Flip hint is shown when the card is still face-up (answer hidden). */}
      {!session.isFlipped && (
        <p className="study-hint">Press <kbd>Space</kbd> to flip</p>
      )}
    </div>
  )
}
