import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext(null)

function getSystemDark() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

function resolvesDark(pref) {
  if (pref === 'dark') return true
  if (pref === 'light') return false
  return getSystemDark()
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    const stored = localStorage.getItem('cardie_theme')
    if (stored === 'light' || stored === 'dark' || stored === 'system') return stored
    // Fall back to user's stored preference if available
    try {
      const user = JSON.parse(localStorage.getItem('cardie_user') || 'null')
      if (user?.theme_preference) return user.theme_preference
    } catch { /* ignore */ }
    return 'system'
  })

  const darkMode = resolvesDark(theme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light')
  }, [darkMode])

  // Re-apply when OS preference changes while in 'system' mode
  useEffect(() => {
    if (theme !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => {
      document.documentElement.setAttribute('data-theme', mq.matches ? 'dark' : 'light')
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [theme])

  const setTheme = (pref) => {
    localStorage.setItem('cardie_theme', pref)
    setThemeState(pref)
  }

  // Navbar toggle: cycle between light and dark (never sets system)
  const toggleDarkMode = () => setTheme(darkMode ? 'light' : 'dark')

  return (
    <ThemeContext.Provider value={{ theme, darkMode, setTheme, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
