import { useRef, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : window.location.origin)

function ReservationForm({ reservation, onSaved, onCancel }) {
  const [guestName, setGuestName] = useState(reservation.guestName)
  const [guestEmail, setGuestEmail] = useState(reservation.guestEmail)
  const [guests, setGuests] = useState(reservation.guests)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const inProgress = useRef(false)

  async function handleSubmit(event) {
    event.preventDefault()

    if (inProgress.current) return

    inProgress.current = true
    setSaving(true)
    setError('')

    try {
      const token = sessionStorage.getItem('token')

      if (!token) {
        throw new Error('Please log in again.')
      }

      const response = await fetch(
        `${API_URL}/api/admin/reservations/${reservation._id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            guestName: guestName.trim(),
            guestEmail: guestEmail.trim(),
            guests: Number(guests),
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Unable to update reservation.')
      }

      onSaved(data)
    } catch (error) {
      setError(
        error instanceof TypeError
          ? 'Cannot reach the server. Check that the backend is running.'
          : error.message
      )
    } finally {
      inProgress.current = false
      setSaving(false)
    }
  }

  return (
    <section className="booking-card">
      <h2>Edit reservation</h2>
      <p>{reservation.property?.title || 'Unavailable property'}</p>
      <p>You can update the guest details and number of guests.</p>

      <form className="login-form" onSubmit={handleSubmit}>
        <label htmlFor="reservation-name">Guest name</label>
        <input
          id="reservation-name"
          type="text"
          value={guestName}
          onChange={(event) => setGuestName(event.target.value)}
          maxLength={100}
          required
          disabled={saving}
        />

        <label htmlFor="reservation-email">Guest email</label>
        <input
          id="reservation-email"
          type="email"
          value={guestEmail}
          onChange={(event) => setGuestEmail(event.target.value)}
          maxLength={254}
          required
          disabled={saving}
        />

        <label htmlFor="reservation-guests">Guests</label>
        <input
          id="reservation-guests"
          type="number"
          min="1"
          step="1"
          value={guests}
          onChange={(event) => setGuests(event.target.value)}
          required
          disabled={saving}
        />

        {error && <p role="alert">{error}</p>}

        <button type="submit" disabled={saving}>
          {saving ? 'Saving…' : 'Save reservation'}
        </button>

        <button type="button" onClick={onCancel} disabled={saving}>
          Cancel
        </button>
      </form>
    </section>
  )
}

export default ReservationForm