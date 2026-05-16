import { useState, useRef, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'
import { searchCards } from '../../services/cardService'

export default function Navbar() {
  const { darkMode, toggleDarkMode } = useTheme()
  const { user, isAdmin, logout } = useAuth()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)
  const navigate = useNavigate()

  const handleSearch = async (e) => {
    const q = e.target.value
    setQuery(q)
    if (q.trim().length < 2) { setResults([]); return }
    setSearching(true)
    try {
      const data = await searchCards(q)
      setResults(data)
    } catch {
      setResults([])
    } finally {
      setSearching(false)
    }
  }

  const handleResultClick = (deckId) => {
    setQuery('')
    setResults([])
    navigate(`/decks/${deckId}`)
  }

  // Close user menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="navbar">
      <Link to={user ? '/decks' : '/'} className="navbar-brand">Cardie</Link>

      {user && (
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
        </div>
      )}

      <div className="navbar-links">
        {user ? (
          <>
            <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}>Dashboard</NavLink>
            <NavLink to="/decks" className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}>My Decks</NavLink>
            <NavLink to="/categories" className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}>Categories</NavLink>
            <NavLink to="/how-it-works" className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}>How It Works</NavLink>
          </>
        ) : (
          <>
            <NavLink to="/how-it-works" className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}>How It Works</NavLink>
            <Link to="/login" className="nav-link">Sign In</Link>
          </>
        )}
      </div>

      <button className="theme-toggle" onClick={toggleDarkMode} aria-label="Toggle dark mode">
        {darkMode ? '☀️' : '🌙'}
      </button>

      {user && (
        <div className="user-menu" ref={menuRef}>
          <button className="user-avatar-btn" onClick={() => setMenuOpen(v => !v)} aria-label="User menu">
            {user.avatar_url
              ? <img src={user.avatar_url.startsWith('uploads/') ? `/api/${user.avatar_url}` : user.avatar_url} alt="" className="nav-avatar" />
              : <span className="nav-avatar-initials">{(user.username || '?')[0].toUpperCase()}</span>
            }
          </button>
          {menuOpen && (
            <div className="user-dropdown">
              <div className="user-dropdown-header">
                <strong>{user.full_name || user.username}</strong>
                <span className={`role-badge role-${user.role}`}>{user.role}</span>
              </div>
              <Link to="/profile" className="user-dropdown-item" onClick={() => setMenuOpen(false)}>My Profile</Link>
              {isAdmin && <Link to="/admin" className="user-dropdown-item" onClick={() => setMenuOpen(false)}>Admin Dashboard</Link>}
              <button className="user-dropdown-item user-dropdown-logout" onClick={handleLogout}>Sign Out</button>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}
