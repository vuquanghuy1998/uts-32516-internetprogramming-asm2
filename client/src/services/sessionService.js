import api from './api'

export const getSessions = (deckId) => api.get(`/decks/${deckId}/sessions`).then(r => r.data)
export const saveSession = (data) => api.post('/sessions', data).then(r => r.data)
