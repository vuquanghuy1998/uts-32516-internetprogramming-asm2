import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTheme } from '../../context/ThemeContext'
import { searchCards } from '../../services/sessionService'

export default function Navbar() {
  const { darkMode, toggleDarkMode } = useTheme()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const navigate = useNavigate()

  const handleSearch = async (e) => {
    const q = e.target.value
    setQuery(q)
    if (q.trim().length < 2) { setResults([]); return }
    setSearching(true)
    try {
      const data = await searchCards(q)
      setResults(data)
    } finally {
      setSearching(false)
    }
  }

  const handleResultClick = (deckId) => {
    setQuery('')
    setResults([])
    navigate(`/decks/${deckId}`)
  }

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">Cardie</Link>
      <div className="navbar-search">
        <input
          type="text"
          placeholder="Search cards..."
          value={query}
          onChange={handleSearch}
          className="search-input"
        />
        {results.length > 0 && (
          <div className="search-dropdown">
            {results.map(card => (
              <button
                key={card.id}
                className="search-result"
                onClick={() => handleResultClick(card.deck_id)}
              >
                <span className="search-result-deck">{card.deck_name}</span>
                <span
                  className="search-result-question"
                  dangerouslySetInnerHTML={{ __html: card.question }}
                />
              </button>
            ))}
          </div>
        )}
        {searching && <span className="search-spinner" />}
      </div>
      <button
        className="theme-toggle"
        onClick={toggleDarkMode}
        aria-label="Toggle dark mode"
      >
        {darkMode ? '☀️' : '🌙'}
      </button>
    </nav>
  )
}
