import { useState, useEffect, useCallback } from 'react'
import { getCards, createCard, updateCard, deleteCard } from '../services/cardService'

// This custom hook handles all the data-fetching and card operations for a
// specific deck. Any component that needs to work with cards just calls this
// hook instead of making API calls directly — keeping things clean and reusable.
export function useCards(deckId) {
  const [cards, setCards] = useState([]) // The list of cards fetched from the database
  const [loading, setLoading] = useState(true) // True while waiting for the API response
  const [error, setError] = useState(null) // Stores any error message if something goes wrong

  // useCallback here means fetchCards won't be recreated every render;
  // only when deckId changes. This is important because fetchCards is used
  // as a dependency in useEffect below, and without this it would cause
  // an infinite loop.
  const fetchCards = useCallback(async () => {
    // Don't try to fetch if there's no deck selected yet
    if (!deckId) return
    setLoading(true)
    try {
      const data = await getCards(deckId)
      setCards(data)
    } catch (err) {
      // If the API call fails (e.g. server is down), save the error message
      // so the component can show a useful message instead of a blank screen
      setError(err.message)
    } finally {
      // This runs whether the request succeeded or failed — always turn off
      // the loading spinner when we're done
      setLoading(false)
    }
  }, [deckId])

  // Run fetchCards once when the component mounts, and again whenever deckId changes
  useEffect(() => { fetchCards() }, [fetchCards])

  // Add a new card to the database, then immediately add it to local state
  // so the UI updates right away without needing a full page refresh
  const addCard = async (formData) => {
    const card = await createCard(deckId, formData)
    setCards(prev => [...prev, card])
    return card
  }

  // Update a card in the database, then update just that one card in local state.
  // .map() goes through every card — if the id matches, replace it with the
  // updated version; otherwise keep the card unchanged.
  const editCard = async (id, formData) => {
    const card = await updateCard(id, formData)
    setCards(prev => prev.map(c => c.id === id ? card : c))
    return card
  }

  // Delete a card from the database, then remove it from local state using
  // .filter() to keep only cards whose id does NOT match the deleted one
  const removeCard = async (id) => {
    await deleteCard(id)
    setCards(prev => prev.filter(c => c.id !== id))
  }

  return { cards, loading, error, refetch: fetchCards, addCard, editCard, removeCard }
}
