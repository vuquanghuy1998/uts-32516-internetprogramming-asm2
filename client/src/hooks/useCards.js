import { useState, useEffect, useCallback } from 'react'
import { getCards, createCard, updateCard, deleteCard } from '../services/cardService'

export function useCards(deckId) {
  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchCards = useCallback(async () => {
    if (!deckId) return
    setLoading(true)
    try {
      const data = await getCards(deckId)
      setCards(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [deckId])

  useEffect(() => { fetchCards() }, [fetchCards])

  const addCard = async (formData) => {
    const card = await createCard(deckId, formData)
    setCards(prev => [...prev, card])
    return card
  }

  const editCard = async (id, formData) => {
    const card = await updateCard(id, formData)
    setCards(prev => prev.map(c => c.id === id ? card : c))
    return card
  }

  const removeCard = async (id) => {
    await deleteCard(id)
    setCards(prev => prev.filter(c => c.id !== id))
  }

  return { cards, loading, error, refetch: fetchCards, addCard, editCard, removeCard }
}
