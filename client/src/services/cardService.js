import api from './api'

export const getCards = (deckId) => api.get(`/decks/${deckId}/cards`).then(r => r.data)

export const createCard = (deckId, formData) =>
  api.post(`/decks/${deckId}/cards`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data)

export const updateCard = (id, formData) =>
  api.put(`/cards/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data)

export const deleteCard = (id) => api.delete(`/cards/${id}`).then(r => r.data)

export const searchCards = (q) => api.get(`/search?q=${encodeURIComponent(q)}`).then(r => r.data)