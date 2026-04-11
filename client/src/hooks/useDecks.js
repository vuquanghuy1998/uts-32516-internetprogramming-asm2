import { useState, useEffect, useCallback } from 'react'
import { getDecks, createDeck, updateDeck, deleteDeck, duplicateDeck } from '../services/deckService'

export function useDecks() {
  const [decks, setDecks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchDecks = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getDecks()
      setDecks(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchDecks() }, [fetchDecks])

  const addDeck = async (data) => {
    const deck = await createDeck(data)
    setDecks(prev => [...prev, deck])
    return deck
  }

  const editDeck = async (id, data) => {
    const deck = await updateDeck(id, data)
    setDecks(prev => prev.map(d => d.id === id ? deck : d))
    return deck
  }

  const removeDeck = async (id) => {
    await deleteDeck(id)
    setDecks(prev => prev.filter(d => d.id !== id))
  }

  const cloneDeck = async (id) => {
    const deck = await duplicateDeck(id)
    setDecks(prev => [...prev, deck])
    return deck
  }

  return { decks, loading, error, refetch: fetchDecks, addDeck, editDeck, removeDeck, cloneDeck }
}
