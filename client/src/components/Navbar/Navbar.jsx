// Navbar.jsx
// Sticky top navigation bar. Layout order (left → right):
//   "Cardie" logo | Search box (grows to fill space) | nav links | dark-mode toggle
// The search dropdown fires against the API after the user types ≥2 characters
// and closes when a result is clicked or the query is cleared.

import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
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
      {/* Brand */}
      <Link to="/" className="navbar-brand">Cardie</Link>

      {/* Search — flex-grows to fill the middle of the bar */}
      <div className="navbar-search">
        <input
          type="text"
          placeholder="Search cards…"
          value={query}
          onChange={handleSearch}
          className="search-input"
          aria-label="Search cards"
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

      {/* Navigation links */}
      <div className="navbar-links">
        <NavLink
          to="/decks"
          className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}
        >
          My Decks
        </NavLink>
        <NavLink
          to="/categories"
          className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}
        >
          Categories
        </NavLink>
      </div>

      {/* Dark / light mode toggle */}
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
