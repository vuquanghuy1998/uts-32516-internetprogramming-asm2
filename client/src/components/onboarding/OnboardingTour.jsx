// OnboardingTour — a simple step-by-step tooltip overlay.
// Triggered when user.has_completed_onboarding === false.
// On completion it calls PATCH /api/users/me to mark the tour done.
import { useState } from 'react'
import { updateMe } from '../../services/userService'
import { useAuth } from '../../context/AuthContext'

const STEPS = [
  {
    title: '👋 Welcome to Cardie!',
    body: 'Cardie helps you study with smart flashcard sessions. Let\'s take a quick tour so you can start learning straight away.',
    target: null,
  },
  {
    title: '📚 Create a Deck',
    body: 'A deck is a collection of flashcards on one topic. Click "+ New Deck" on the Decks page to create your first deck. Give it a name and optionally assign it to a category.',
    target: null,
  },
  {
    title: '✏️ Add Flashcards',
    body: 'Inside a deck, click "+ Add Card" to write your question and answer using the rich text editor. You can bold text, add code blocks, and upload images.',
    target: null,
  },
  {
    title: '▶ Start Studying',
    body: 'Hit "Study" on any deck to start a session. Flip each card, rate it Easy / Hard / Missed, and Cardie will re-queue the hard ones automatically.',
    target: null,
  },
  {
    title: '🎉 You\'re all set!',
    body: 'That\'s the whole flow! Head to My Decks to create your first deck. You can always revisit this guide from the "How It Works" link in the navbar.',
    target: null,
  },
]

export default function OnboardingTour({ onDone }) {
  const { updateUser } = useAuth()
  const [step, setStep] = useState(0)
  const [dismissing, setDismissing] = useState(false)

  const current = STEPS[step]
  const isLast = step === STEPS.length - 1

  const advance = () => {
    if (isLast) {
      complete()
    } else {
      setStep(s => s + 1)
    }
  }

  const complete = async () => {
    setDismissing(true)
    try {
      const updated = await updateMe({ has_completed_onboarding: true })
      updateUser(updated)
    } catch { /* non-critical */ }
    onDone()
  }

  return (
    <div className="onboarding-backdrop">
      <div className="onboarding-card">
        <div className="onboarding-step-counter">
          {STEPS.map((_, i) => (
            <span key={i} className={`onboarding-dot ${i === step ? 'active' : i < step ? 'done' : ''}`} />
          ))}
        </div>
        <h2 className="onboarding-title">{current.title}</h2>
        <p className="onboarding-body">{current.body}</p>
        <div className="onboarding-actions">
          <button className="btn btn-secondary btn-sm" onClick={complete} disabled={dismissing}>
            Skip tour
          </button>
          <button className="btn btn-primary" onClick={advance} disabled={dismissing}>
            {isLast ? 'Get started!' : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  )
}
