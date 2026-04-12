import { useState, useEffect, useCallback } from 'react'
import { getDecks, createDeck, updateDeck, deleteDeck, duplicateDeck } from '../services/deckService'

// This custom hook manages all deck data and operations in one place.
export function useDecks() {
  const [decks, setDecks] = useState([]) // The list of decks from the database
  const [loading, setLoading] = useState(true) // Set to true while the API request is in progress
  const [error, setError] = useState(null) // Holds an error message if the fetch fails

  // useCallback prevents this function from being recreated on every render.
  // The empty [] dependency array means it's only ever created once, which
  // stops the useEffect below from running in an infinite loop.
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

   // Fetch decks once when the component using this hook first mounts
  useEffect(() => { fetchDecks() }, [fetchDecks])

  // Create a new deck via the API, then append it to the local list so
  // the page updates immediately without needing to refetch everything
  const addDeck = async (data) => {
    const deck = await createDeck(data)
    setDecks(prev => [...prev, deck])
    return deck
  }

  // Update a deck in the database, then use .map() to swap just that one
  // deck in local state (matching by id) — all other decks stay the same
  const editDeck = async (id, data) => {
    const deck = await updateDeck(id, data)
    setDecks(prev => prev.map(d => d.id === id ? deck : d))
    return deck
  }

  // Delete the deck from the database, then use .filter() to remove it
  // from local state by keeping every deck whose id is NOT the deleted one
  const removeDeck = async (id) => {
    await deleteDeck(id)
    setDecks(prev => prev.filter(d => d.id !== id))
  }

  // Duplicate an existing deck (the backend handles copying all its cards too),
  // then append the new copy to the local list so it appears straight away
  const cloneDeck = async (id) => {
    const deck = await duplicateDeck(id)
    setDecks(prev => [...prev, deck])
    return deck
  }

  return { decks, loading, error, refetch: fetchDecks, addDeck, editDeck, removeDeck, cloneDeck }
}
