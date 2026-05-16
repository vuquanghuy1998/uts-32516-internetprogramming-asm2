import { useEffect } from 'react'
import { Link } from 'react-router-dom'

const STEPS = [
  {
    icon: '📚',
    title: 'Create Your Decks',
    body: 'Organise your study material into decks — one deck per topic, lecture, or subject. Give each deck a name, description, and optionally assign it to a category so you can filter them later. You can also choose a cover image and customise the card style.',
  },
  {
    icon: '✏️',
    title: 'Add Flashcards',
    body: 'Each flashcard has a question and an answer, both with rich text formatting (bold, italic, code blocks). You can also attach an image for diagrams or screenshots. Tag your cards to filter and search them across decks.',
  },
  {
    icon: '🃏',
    title: 'Study with Smart Queuing',
    body: 'Start a study session and flip each card to reveal its answer. Rate it: Easy removes the card from this session, Hard re-inserts it 3 cards later, and Missed puts it back as the very next card. Keep going until every card is Easy.',
  },
  {
    icon: '📈',
    title: 'Track Your Progress',
    body: 'After every session, Cardie saves your accuracy and per-card ratings. The deck dashboard shows your mastery percentage, session history, and your hardest and easiest cards — so you always know what to focus on.',
  },
]

export default function HowItWorksPage() {
  useEffect(() => { document.title = 'How It Works — Cardie' }, [])

  return (
    <div className="page">
      <div className="how-hero">
        <h1>How Cardie Works</h1>
        <p className="how-sub">
          Cardie uses a session-based smart queue — not a complex algorithm — to help you focus on
          the cards you actually struggle with. Here's how the four-step flow works:
        </p>
      </div>

      <div className="how-steps">
        {STEPS.map((s, i) => (
          <div key={i} className="how-step">
            <div className="how-step-icon">{s.icon}</div>
            <div className="how-step-body">
              <h2>{i + 1}. {s.title}</h2>
              <p>{s.body}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="how-rating">
        <h2>Rating System</h2>
        <div className="rating-legend">
          <div className="rating-item">
            <span className="btn btn-easy">✅ Easy</span>
            <p>Card is <strong>removed</strong> from the queue — you know this one!</p>
          </div>
          <div className="rating-item">
            <span className="btn btn-hard">😰 Hard</span>
            <p>Card is <strong>reinserted 3 positions</strong> later — you'll see it again soon.</p>
          </div>
          <div className="rating-item">
            <span className="btn btn-missed">❌ Missed</span>
            <p>Card comes back <strong>immediately</strong> as the next card — try again now.</p>
          </div>
        </div>
        <p className="how-formula">
          <strong>Accuracy</strong> = Easy ratings ÷ total rated × 100.
          A session ends when every card has been rated Easy (or you end early).
        </p>
      </div>

      <div className="how-cta">
        <Link to="/decks" className="btn btn-primary btn-lg">Go to My Decks</Link>
        <Link to="/register" className="btn btn-secondary btn-lg">Create Account</Link>
      </div>
    </div>
  )
}
