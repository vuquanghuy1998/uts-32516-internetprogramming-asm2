// Dashboard.jsx
// Progress dashboard for a single deck. Fetches deck metadata, all flashcards,
// and study session history in parallel, then derives mastery statistics from
// the cumulative ease/hard/missed counts stored on each card. Displays an
// overall mastery percentage, a visual progress bar, session history, and the
// top-5 hardest and easiest cards ranked by their miss and easy counts.

import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getDeck } from '../services/deckService'
import { getCards } from '../services/cardService'
import { getSessions } from '../services/sessionService'
import { showToast } from '../components/Toast/Toast'

export default function Dashboard() {
  const { deckId } = useParams()
  const [deck, setDeck] = useState(null)
  const [cards, setCards] = useState([])
  const [sessions, setSessions] = useState([])

  // Fetch all three data sources simultaneously so the page loads in a single
  // round-trip rather than three sequential requests.
  useEffect(() => {
    Promise.all([getDeck(deckId), getCards(deckId), getSessions(deckId)])
      .then(([d, c, s]) => { setDeck(d); setCards(c); setSessions(s) })
      .catch(() => showToast('Failed to load dashboard', 'error'))
  }, [deckId])

  // Sum every rating (easy + hard + missed) across all cards to get the
  // denominator for the mastery percentage calculation.
  const totalRatings = cards.reduce((sum, c) => sum + c.ease_count + c.hard_count + c.missed_count, 0)

  // Sum only the "easy" ratings — these are the numerator for mastery.
  const totalEasy = cards.reduce((sum, c) => sum + c.ease_count, 0)

  // Mastery % = easy ratings / all ratings × 100. Guard against division by
  // zero when no cards have been rated yet.
  const mastery = totalRatings > 0 ? Math.round((totalEasy / totalRatings) * 100) : 0

  // Sort a shallow copy (spread avoids mutating state) by missed_count descending
  // and keep only the five cards the user struggles with most.
  const hardestCards = [...cards].sort((a, b) => b.missed_count - a.missed_count).slice(0, 5)

  // Same approach but sorted by ease_count descending for the five easiest cards.
  const easiestCards = [...cards].sort((a, b) => b.ease_count - a.ease_count).slice(0, 5)

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <Link to={`/decks/${deckId}`} className="breadcrumb">← Back to Deck</Link>
          {/* Show the deck name once loaded; fall back to "Dashboard" while fetching. */}
          <h1>{deck?.name ?? 'Dashboard'}</h1>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* ── Mastery panel ───────────────────────────────────────────────── */}
        <div className="dashboard-card">
          <h2>Overall Mastery</h2>
          <div className="mastery-percent">{mastery}%</div>
          {/* The inner div's inline width drives the CSS progress bar fill. */}
          <div className="mastery-bar">
            <div className="mastery-fill" style={{ width: `${mastery}%` }} />
          </div>
          <div className="mastery-breakdown">
            <span>✅ {totalEasy} easy</span>
            {/* Inline reduces here because these totals aren't needed elsewhere. */}
            <span>😰 {cards.reduce((s, c) => s + c.hard_count, 0)} hard</span>
            <span>❌ {cards.reduce((s, c) => s + c.missed_count, 0)} missed</span>
          </div>
        </div>

        {/* ── Session history panel ────────────────────────────────────────── */}
        <div className="dashboard-card">
          <h2>Session History</h2>
          {sessions.length === 0 ? (
            <p className="empty-state">No sessions yet</p>
          ) : (
            <table className="session-table">
              <thead>
                <tr><th>Date</th><th>Cards</th><th>Accuracy</th></tr>
              </thead>
              <tbody>
                {sessions.map(s => (
                  <tr key={s.id}>
                    {/* Convert the ISO timestamp from the DB to a locale-friendly date string. */}
                    <td>{new Date(s.studied_at).toLocaleDateString()}</td>
                    <td>{s.total_cards}</td>
                    <td>{s.accuracy_percent}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* ── Hardest cards panel ──────────────────────────────────────────── */}
        <div className="dashboard-card">
          <h2>Hardest Cards (top 5)</h2>
          {hardestCards.map(c => (
            <div key={c.id} className="card-stat-row">
              {/* Card questions are stored as TipTap HTML, so we render them
                  with dangerouslySetInnerHTML — content originates from the
                  user's own input, not external sources. */}
              <span dangerouslySetInnerHTML={{ __html: c.question }} className="card-stat-q" />
              <span>❌ {c.missed_count}</span>
            </div>
          ))}
        </div>

        {/* ── Easiest cards panel ──────────────────────────────────────────── */}
        <div className="dashboard-card">
          <h2>Easiest Cards (top 5)</h2>
          {easiestCards.map(c => (
            <div key={c.id} className="card-stat-row">
              <span dangerouslySetInnerHTML={{ __html: c.question }} className="card-stat-q" />
              <span>✅ {c.ease_count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
