import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getCards } from '../services/cardService'
import { saveSession } from '../services/sessionService'
import { useStudySession } from '../hooks/useStudySession'
import CardFlip from '../components/CardFlip/CardFlip'
import { showToast } from '../components/Toast/Toast'

export default function StudyMode() {
  const { deckId } = useParams()
  const navigate = useNavigate()
  const [cards, setCards] = useState([])
  const [shuffled, setShuffled] = useState(false)
  const [started, setStarted] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getCards(deckId).then(setCards).catch(() => showToast('Failed to load cards', 'error'))
  }, [deckId])

  const session = useStudySession(started ? cards : [], shuffled)

  // Keyboard shortcuts
  const handleKey = useCallback((e) => {
    if (!started || session.sessionDone) return
    if (e.key === ' ') { e.preventDefault(); session.flip() }
    if (e.key === '1' && session.isFlipped) session.rate('missed')
    if (e.key === '2' && session.isFlipped) session.rate('hard')
    if (e.key === '3' && session.isFlipped) session.rate('easy')
    if (e.key === 'Escape') session.endSession()
  }, [started, session])

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
        card_ratings: session.queue,
      })
      showToast('Session saved!')
    } catch {
      showToast('Failed to save session', 'error')
    } finally {
      setSaving(false)
      navigate(`/decks/${deckId}`)
    }
  }

  if (!started) {
    return (
      <div className="study-start">
        <h1>Ready to study?</h1>
        <p>{cards.length} cards in this deck</p>
        <label className="shuffle-toggle">
          <input type="checkbox" checked={shuffled} onChange={e => setShuffled(e.target.checked)} />
          Shuffle cards
        </label>
        <button className="btn btn-primary btn-lg" onClick={() => setStarted(true)} disabled={cards.length === 0}>
          Start Session
        </button>
        <button className="btn btn-secondary" onClick={() => navigate(`/decks/${deckId}`)}>Back</button>
      </div>
    )
  }

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
        <button className="btn btn-primary" onClick={handleSaveAndExit} disabled={saving}>
          {saving ? 'Saving…' : 'Save & Exit'}
        </button>
        <button className="btn btn-secondary" onClick={() => navigate(`/decks/${deckId}`)}>Exit Without Saving</button>
      </div>
    )
  }

  return (
    <div className="study-mode">
      <div className="study-dashboard">
        <span title="Easy">✅ {session.stats.easy}</span>
        <span title="Hard">😰 {session.stats.hard}</span>
        <span title="Missed">❌ {session.stats.missed}</span>
        <span title="Accuracy">📈 {session.accuracy}%</span>
        <span title="Remaining">🃏 {session.remaining}</span>
        <span title="Revisits">🔁 {session.revisitCount}</span>
        <button className="btn btn-secondary btn-sm" onClick={handleEndSession}>End</button>
      </div>

      {session.currentCard && (
        <CardFlip card={session.currentCard} isFlipped={session.isFlipped} onFlip={session.flip} />
      )}

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

      {!session.isFlipped && (
        <p className="study-hint">Press <kbd>Space</kbd> to flip</p>
      )}
    </div>
  )
}
