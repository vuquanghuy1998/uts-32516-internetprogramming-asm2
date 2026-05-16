import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/Navbar/Navbar'
import { ToastContainer } from './components/Toast/Toast'
import Landing from './pages/Landing'
import Home from './pages/Home'
import Categories from './pages/Categories'
import CategoryDetail from './pages/CategoryDetail'
import DeckView from './pages/DeckView'
import StudyMode from './pages/StudyMode'
import Dashboard from './pages/Dashboard'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProfilePage from './pages/ProfilePage'
import AdminPage from './pages/AdminPage'
import HowItWorksPage from './pages/HowItWorksPage'
import './App.css'

// Redirects to /login if no JWT is present
function ProtectedRoute({ children }) {
  const { token } = useAuth()
  if (!token) return <Navigate to="/login" replace />
  return children
}

// Redirects to /decks if user is not admin
function AdminRoute({ children }) {
  const { token, isAdmin } = useAuth()
  if (!token) return <Navigate to="/login" replace />
  if (!isAdmin) return <Navigate to="/decks" replace />
  return children
}

// Listens for the session-expired event fired by the axios interceptor
function SessionExpiredListener() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  useEffect(() => {
    const handler = () => { logout(); navigate('/login') }
    window.addEventListener('cardie:session-expired', handler)
    return () => window.removeEventListener('cardie:session-expired', handler)
  }, [logout, navigate])
  return null
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <SessionExpiredListener />
          <Navbar />
          <main className="main-content">
            <Routes>
              {/* Public */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/how-it-works" element={<HowItWorksPage />} />

              {/* Protected */}
              <Route path="/decks" element={<ProtectedRoute><Home /></ProtectedRoute>} />
              <Route path="/categories" element={<ProtectedRoute><Categories /></ProtectedRoute>} />
              <Route path="/categories/:categoryId" element={<ProtectedRoute><CategoryDetail /></ProtectedRoute>} />
              <Route path="/decks/:deckId" element={<ProtectedRoute><DeckView /></ProtectedRoute>} />
              <Route path="/decks/:deckId/study" element={<ProtectedRoute><StudyMode /></ProtectedRoute>} />
              <Route path="/decks/:deckId/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

              {/* Admin only */}
              <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
            </Routes>
          </main>
          <ToastContainer />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}
