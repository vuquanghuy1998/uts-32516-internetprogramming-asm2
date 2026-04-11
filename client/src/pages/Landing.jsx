// Landing.jsx
// The public-facing homepage shown at "/". Introduces the app with a short
// pitch and a single call-to-action that takes the user to the Decks page.
// No data fetching is needed here — this page is entirely static.

import { Link } from 'react-router-dom'

export default function Landing() {
  return (
    <div className="landing">
      <div className="landing-hero">
        <h1 className="landing-title">Learn anything.<br />One card at a time.</h1>
        <p className="landing-sub">
          Cardie is a flashcard app that helps you study smarter. Create decks,
          add rich-text cards, and let the session-based review system surface the
          cards you struggle with most — until you've truly mastered them.
        </p>
        <div className="landing-actions">
          <Link to="/decks" className="btn btn-primary btn-lg">Start Studying →</Link>
        </div>
      </div>

      <div className="landing-features">
        <div className="feature-card">
          <span className="feature-icon">🃏</span>
          <h3>Rich flashcards</h3>
          <p>Write questions and answers with bold, italic, inline code, and code blocks. Attach an image to any card.</p>
        </div>
        <div className="feature-card">
          <span className="feature-icon">🔁</span>
          <h3>Smart review queue</h3>
          <p>Cards you miss come back immediately. Hard cards loop back in a few cards. Easy cards leave the queue.</p>
        </div>
        <div className="feature-card">
          <span className="feature-icon">📈</span>
          <h3>Progress dashboard</h3>
          <p>See your mastery percentage, session history, and which cards need the most attention.</p>
        </div>
      </div>
    </div>
  )
}
