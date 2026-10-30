import { useRef, useState } from 'react'

const API_URL =
  import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : window.location.origin)

function roundMoney(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

function money(amount) {
  return `R${amount.toFixed(2)}`
}

function BookingForm({ property }) {
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [guests, setGuests] = useState('1')
  const [guestName, setGuestName] = useState('')
  const [guestEmail, setGuestEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [confirmation, setConfirmation] = useState(null)
  const requestInProgress = useRef(false)

  const today = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Africa/Johannesburg',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())

  const nights =
    checkIn && checkOut
      ? (Date.parse(checkOut) - Date.parse(checkIn)) / 86400000
      : 0

  const validDates =
    checkIn >= today &&
    Number.isInteger(nights) &&
    nights > 0 &&
    nights <= 365

  // Sample pricing rules matching the backend.
  const accommodation = validDates
    ? roundMoney(nights * property.price)
    : 0
  const discount =
    nights >= 7 ? roundMoney(accommodation * 0.1) : 0
  const cleaningFee = 150
  const serviceFee = roundMoney((accommodation - discount) * 0.1)
  const subtotal = roundMoney(
    accommodation - discount + cleaningFee + serviceFee
  )
  const taxes = roundMoney(subtotal * 0.15)
  const total = roundMoney(subtotal + taxes)

  async function handleReserve(event) {
    event.preventDefault()

    if (requestInProgress.current || confirmation) return

    setError('')

    if (!validDates) {
      setError('Choose valid dates for a stay of 1–365 nights.')
      return
    }

    if (!guestName.trim()) {
      setError('Enter your name.')
      return
    }

    requestInProgress.current = true
    setSubmitting(true)

    try {
      const response = await fetch(`${API_URL}/api/reservations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          propertyId: property._id,
          guestName: guestName.trim(),
          guestEmail: guestEmail.trim(),
          checkIn,
          checkOut,
          guests: Number(guests),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Unable to save your reservation.')
      }

      setConfirmation(data)
    } catch (error) {
      setError(
        error instanceof TypeError
          ? 'Could not reach the server. Please check your connection.'
          : error.message
      )
    } finally {
      requestInProgress.current = false
      setSubmitting(false)
    }
  }

  if (confirmation) {
    return (
      <section className="booking-card" role="status">
        <h2>Reservation confirmed!</h2>
        <p>{property.title}</p>
        <p>
          {checkIn} to {checkOut} · {guests}{' '}
          {Number(guests) === 1 ? 'guest' : 'guests'}
        </p>
        <p>
          <strong>Total: {money(confirmation.total)}</strong>
        </p>
        <p>
          Reference: <strong>{confirmation.reservationId}</strong>
        </p>
        <p>No payment has been taken. This is a demo reservation.</p>
      </section>
    )
  }

  return (
    <section className="booking-card">
      <h2>{money(property.price)} / night</h2>

      <form onSubmit={handleReserve}>
        <div className="booking-fields">
          <label>
            Check in
            <input
              type="date"
              min={today}
              value={checkIn}
              onChange={(event) => setCheckIn(event.target.value)}
              required
              disabled={submitting}
            />
          </label>

          <label>
            Check out
            <input
              type="date"
              min={checkIn || today}
              value={checkOut}
              onChange={(event) => setCheckOut(event.target.value)}
              required
              disabled={submitting}
            />
          </label>

          <label>
            Guests
            <select
              value={guests}
              onChange={(event) => setGuests(event.target.value)}
              disabled={submitting}
            >
              {Array.from({ length: property.guests }, (_, index) => (
                <option key={index + 1} value={index + 1}>
                  {index + 1}
                </option>
              ))}
            </select>
          </label>

          <label>
            Full name
            <input
              type="text"
              autoComplete="name"
              maxLength={100}
              value={guestName}
              onChange={(event) => setGuestName(event.target.value)}
              required
              disabled={submitting}
            />
          </label>

          <label>
            Email address
            <input
              type="email"
              autoComplete="email"
              maxLength={254}
              value={guestEmail}
              onChange={(event) => setGuestEmail(event.target.value)}
              required
              disabled={submitting}
            />
          </label>
        </div>

        {checkIn && checkOut && !validDates && (
          <p role="alert">
            Check-in must be today or later, and check-out must be
            after check-in. The maximum stay is 365 nights.
          </p>
        )}

        {validDates ? (
          <div className="booking-summary" aria-live="polite">
            <p>
              <span>{money(property.price)} × {nights} nights</span>
              <span>{money(accommodation)}</span>
            </p>

            {discount > 0 && (
              <p>
                <span>Weekly discount (10%)</span>
                <span>−{money(discount)}</span>
              </p>
            )}

            <p>
              <span>Cleaning fee</span>
              <span>{money(cleaningFee)}</span>
            </p>

            <p>
              <span>Service fee (10%)</span>
              <span>{money(serviceFee)}</span>
            </p>

            <p>
              <span>Tax (demo rate: 15%)</span>
              <span>{money(taxes)}</span>
            </p>

            <p className="booking-total">
              <strong>Total</strong>
              <strong>{money(total)}</strong>
            </p>
          </div>
        ) : (
          <p>Select your dates to see the total.</p>
        )}

        {error && <p role="alert">{error}</p>}

        <button
          className="search-button"
          type="submit"
          disabled={!validDates || submitting}
        >
          {submitting ? 'Saving reservation...' : 'Reserve'}
        </button>

        <p>Demo booking only. No payment will be taken.</p>
      </form>
    </section>
  )
}

export default BookingForm