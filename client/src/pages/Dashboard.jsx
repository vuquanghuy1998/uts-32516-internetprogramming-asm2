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

  useEffect(() => {
    Promise.all([getDeck(deckId), getCards(deckId), getSessions(deckId)])
      .then(([d, c, s]) => { setDeck(d); setCards(c); setSessions(s) })
      .catch(() => showToast('Failed to load dashboard', 'error'))
  }, [deckId])

  const totalRatings = cards.reduce((sum, c) => sum + c.ease_count + c.hard_count + c.missed_count, 0)
  const totalEasy = cards.reduce((sum, c) => sum + c.ease_count, 0)
  const mastery = totalRatings > 0 ? Math.round((totalEasy / totalRatings) * 100) : 0

  const hardestCards = [...cards].sort((a, b) => b.missed_count - a.missed_count).slice(0, 5)
  const easiestCards = [...cards].sort((a, b) => b.ease_count - a.ease_count).slice(0, 5)

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <Link to={`/decks/${deckId}`} className="breadcrumb">← Back to Deck</Link>
          <h1>{deck?.name ?? 'Dashboard'}</h1>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h2>Overall Mastery</h2>
          <div className="mastery-percent">{mastery}%</div>
          <div className="mastery-bar">
            <div className="mastery-fill" style={{ width: `${mastery}%` }} />
          </div>
          <div className="mastery-breakdown">
            <span>✅ {totalEasy} easy</span>
            <span>😰 {cards.reduce((s, c) => s + c.hard_count, 0)} hard</span>
            <span>❌ {cards.reduce((s, c) => s + c.missed_count, 0)} missed</span>
          </div>
        </div>

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
                    <td>{new Date(s.studied_at).toLocaleDateString()}</td>
                    <td>{s.total_cards}</td>
                    <td>{s.accuracy_percent}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="dashboard-card">
          <h2>Hardest Cards (top 5)</h2>
          {hardestCards.map(c => (
            <div key={c.id} className="card-stat-row">
              <span dangerouslySetInnerHTML={{ __html: c.question }} className="card-stat-q" />
              <span>❌ {c.missed_count}</span>
            </div>
          ))}
        </div>

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
