import { useState, useCallback, useEffect } from 'react'

let toastQueue = []
let listeners = []

export function showToast(message, type = 'success') {
  const id = Date.now()
  toastQueue = [...toastQueue, { id, message, type }]
  listeners.forEach(fn => fn([...toastQueue]))
  setTimeout(() => {
    toastQueue = toastQueue.filter(t => t.id !== id)
    listeners.forEach(fn => fn([...toastQueue]))
  }, 3000)
}

export function ToastContainer() {
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    listeners.push(setToasts)
    return () => { listeners = listeners.filter(fn => fn !== setToasts) }
  }, [])

  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          {t.message}
        </div>
      ))}
    </div>
  )
}
