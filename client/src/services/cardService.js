import api from './api'
import axios from 'axios'

export const getCards = (deckId) => api.get(`/decks/${deckId}/cards`).then(r => r.data)

export const createCard = (deckId, formData) =>
  axios.post(`/api/decks/${deckId}/cards`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data)

export const updateCard = (id, formData) =>
  axios.put(`/api/cards/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data)

export const deleteCard = (id) => api.delete(`/cards/${id}`).then(r => r.data)
