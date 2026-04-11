import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import Navbar from './components/Navbar/Navbar'
import { ToastContainer } from './components/Toast/Toast'
import Landing from './pages/Landing'
import Home from './pages/Home'
import Categories from './pages/Categories'
import DeckView from './pages/DeckView'
import StudyMode from './pages/StudyMode'
import Dashboard from './pages/Dashboard'
import './App.css'

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/decks" element={<Home />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/decks/:deckId" element={<DeckView />} />
            <Route path="/decks/:deckId/study" element={<StudyMode />} />
            <Route path="/decks/:deckId/dashboard" element={<Dashboard />} />
          </Routes>
        </main>
        <ToastContainer />
      </BrowserRouter>
    </ThemeProvider>
  )
}
