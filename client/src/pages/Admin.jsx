import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Header from '../components/Header'
import PropertyForm from '../components/PropertyForm'
import ReservationForm from '../components/ReservationForm'
import imageUrl from '../imageUrl'

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : window.location.origin)

function Admin() {
  const [searchParams, setSearchParams] = useSearchParams()
  const view = searchParams.get('view') === 'reservations'
    ? 'reservations'
    : 'listings'

  const [properties, setProperties] = useState([])
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingProperty, setEditingProperty] = useState(null)
  const [editingReservation, setEditingReservation] = useState(null)
  const [message, setMessage] = useState('')
  const [reservationMessage, setReservationMessage] = useState('')
  const [deletingId, setDeletingId] = useState(null)
  const [deletingReservationId, setDeletingReservationId] = useState(null)

  const busy =
    showForm ||
    editingReservation !== null ||
    deletingId !== null ||
    deletingReservationId !== null

  useEffect(() => {
    const controller = new AbortController()

    async function loadDashboard() {
      try {
        const token = sessionStorage.getItem('token')

        if (!token) {
          throw new Error('Please log in to access the admin dashboard.')
        }

        async function getData(endpoint) {
          const response = await fetch(`${API_URL}${endpoint}`, {
            headers: { Authorization: `Bearer ${token}` },
            signal: controller.signal,
          })

          const data = await response.json()

          if (!response.ok) {
            throw new Error(data.message || 'Unable to load the dashboard.')
          }

          if (!Array.isArray(data)) {
            throw new Error('The server returned an unexpected response.')
          }

          return data
        }

        const [propertyData, reservationData] = await Promise.all([
          getData('/api/admin/properties'),
          getData('/api/admin/reservations'),
        ])

        if (!controller.signal.aborted) {
          setProperties(propertyData)
          setReservations(reservationData)
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setError(
            error instanceof TypeError
              ? 'Cannot reach the server. Check that your backend is running.'
              : error.message
          )
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    loadDashboard()
    return () => controller.abort()
  }, [])

  function handleAdd() {
    setSearchParams({ view: 'listings' })
    setEditingProperty(null)
    setMessage('')
    setShowForm(true)
  }

  function handleEdit(property) {
    setEditingProperty(property)
    setMessage('')
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleSaved(savedProperty) {
    setProperties((current) => {
      const exists = current.some(
        (property) => property._id === savedProperty._id
      )

      return exists
        ? current.map((property) =>
            property._id === savedProperty._id ? savedProperty : property
          )
        : [savedProperty, ...current]
    })

    setShowForm(false)
    setEditingProperty(null)
    setMessage('Property saved successfully.')
  }

  async function deleteRecord(endpoint) {
    const token = sessionStorage.getItem('token')

    if (!token) throw new Error('Please log in again.')

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Unable to delete this record.')
    }
  }

  function errorMessage(error) {
    return error instanceof TypeError
      ? 'Cannot reach the server. Check that the backend is running.'
      : error.message
  }

  async function handleDelete(property) {
    if (busy) return

    if (!window.confirm(`Delete "${property.title}"? This cannot be undone.`)) {
      return
    }

    setDeletingId(property._id)
    setMessage('')

    try {
      await deleteRecord(`/api/admin/properties/${property._id}`)
      setProperties((current) =>
        current.filter((item) => item._id !== property._id)
      )
      setMessage('Property deleted successfully.')
    } catch (error) {
      setMessage(errorMessage(error))
    } finally {
      setDeletingId(null)
    }
  }

  function handleReservationSaved(updatedReservation) {
    setReservations((current) =>
      current.map((reservation) =>
        reservation._id === updatedReservation._id
          ? updatedReservation
          : reservation
      )
    )

    setEditingReservation(null)
    setReservationMessage('Reservation updated successfully.')
  }

  async function handleDeleteReservation(reservation) {
    if (busy) return

    const confirmed = window.confirm(
      `Delete the reservation for ${reservation.guestName}? ` +
      'This permanently removes it and frees its booked dates.'
    )

    if (!confirmed) return

    setDeletingReservationId(reservation._id)
    setReservationMessage('')

    try {
      await deleteRecord(`/api/admin/reservations/${reservation._id}`)
      setReservations((current) =>
        current.filter((item) => item._id !== reservation._id)
      )
      setReservationMessage('Reservation deleted successfully.')
    } catch (error) {
      setReservationMessage(errorMessage(error))
    } finally {
      setDeletingReservationId(null)
    }
  }

  function formatDate(value) {
    return new Date(value).toLocaleDateString('en-ZA', {
      timeZone: 'UTC',
    })
  }

  return (
    <>
      <Header />

      <main className="admin-page">
        <Link to="/">← Back to home</Link>
        <h1>Admin dashboard</h1>

        {loading && <p role="status">Loading dashboard…</p>}

        {error && (
          <div role="alert">
            <p>{error}</p>
            <Link to="/login">Go to login</Link>
          </div>
        )}

        {!loading && !error && (
          <>
            <nav className="admin-navigation" aria-label="Admin navigation">
              <button
                type="button"
                className="profile-button"
                aria-pressed={view === 'listings'}
                disabled={busy}
                onClick={() => setSearchParams({ view: 'listings' })}
              >
                View listings ({properties.length})
              </button>

              <button
                type="button"
                className="profile-button"
                aria-pressed={view === 'reservations'}
                disabled={busy}
                onClick={() => setSearchParams({ view: 'reservations' })}
              >
                View reservations ({reservations.length})
              </button>

              <button
                type="button"
                className="search-button"
                disabled={busy}
                onClick={handleAdd}
              >
                Create listing
              </button>
            </nav>

            {view === 'listings' && (
              <section>
                <h2>Property listings</h2>
                {message && <p role="status">{message}</p>}

                {showForm && (
                  <PropertyForm
                    key={editingProperty?._id || 'new'}
                    property={editingProperty}
                    onSaved={handleSaved}
                    onCancel={() => {
                      setShowForm(false)
                      setEditingProperty(null)
                    }}
                  />
                )}

                {properties.length === 0 && <p>No properties yet.</p>}

                <div className="results-list">
                  {properties.map((property) => (
                    <article className="result-card" key={property._id}>
                      <img
                        className="result-image"
                        src={imageUrl(property.image)}
                        alt={property.title}
                        loading="lazy"
                      />

                      <div className="result-details">
                        <h3>{property.title}</h3>
                        <p>{property.location}</p>
                        <p>R{property.price.toFixed(2)} per night</p>

                        <div className="admin-actions">
                          <Link to={`/properties/${property._id}`}>
                            View property
                          </Link>

                          <button
                            className="profile-button"
                            type="button"
                            disabled={busy}
                            onClick={() => handleEdit(property)}
                          >
                            Edit property
                          </button>

                          <button
                            className="profile-button"
                            type="button"
                            disabled={busy}
                            onClick={() => handleDelete(property)}
                          >
                            {deletingId === property._id
                              ? 'Deleting…'
                              : 'Delete property'}
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}

            {view === 'reservations' && (
              <section>
                <h2>Reservations</h2>

                {reservationMessage && (
                  <p role="status">{reservationMessage}</p>
                )}

                {editingReservation && (
                  <ReservationForm
                    key={editingReservation._id}
                    reservation={editingReservation}
                    onSaved={handleReservationSaved}
                    onCancel={() => setEditingReservation(null)}
                  />
                )}

                {reservations.length === 0 ? (
                  <p>No reservations yet.</p>
                ) : (
                  <div
                    className="admin-table-wrapper"
                    role="region"
                    aria-label="Reservations table"
                    tabIndex={0}
                  >
                    <table className="admin-table">
                      <caption>Manage guest reservations</caption>
                      <thead>
                        <tr>
                          <th scope="col">Booked by</th>
                          <th scope="col">Property</th>
                          <th scope="col">Check-in</th>
                          <th scope="col">Check-out</th>
                          <th scope="col">Guests</th>
                          <th scope="col">Total</th>
                          <th scope="col">Status</th>
                          <th scope="col">Actions</th>
                        </tr>
                      </thead>

                      <tbody>
                        {reservations.map((reservation) => (
                          <tr key={reservation._id}>
                            <td>
                              <strong>{reservation.guestName}</strong>
                              <br />
                              {reservation.guestEmail}
                            </td>
                            <td>
                              {reservation.property?.title ||
                                'Unavailable property'}
                            </td>
                            <td>{formatDate(reservation.checkIn)}</td>
                            <td>{formatDate(reservation.checkOut)}</td>
                            <td>{reservation.guests}</td>
                            <td>R{reservation.total.toFixed(2)}</td>
                            <td>{reservation.status}</td>
                            <td>
                              <div className="admin-actions">
                                <button
                                  className="profile-button"
                                  type="button"
                                  disabled={busy}
                                  onClick={() => {
                                    setReservationMessage('')
                                    setEditingReservation(reservation)
                                  }}
                                >
                                  Edit reservation
                                </button>

                                <button
                                  className="profile-button"
                                  type="button"
                                  disabled={busy}
                                  onClick={() =>
                                    handleDeleteReservation(reservation)
                                  }
                                >
                                  {deletingReservationId === reservation._id
                                    ? 'Deleting…'
                                    : 'Delete reservation'}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            )}
          </>
        )}
      </main>
    </>
  )
}

export default Admin