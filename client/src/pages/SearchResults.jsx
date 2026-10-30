import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import '../App.css'
import imageUrl from '../imageUrl'
import Header from '../components/Header'

const API_URL =
  import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : window.location.origin)

function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const location = (searchParams.get('location') || '').trim()
  const guestCount = Number(searchParams.get('guests')) || 1

  useEffect(() => {
    const controller = new AbortController()

    async function loadProperties() {
      try {
        const response = await fetch(`${API_URL}/api/properties`, {
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error('Unable to load properties.')
        }

        const data = await response.json()

        if (!Array.isArray(data)) {
          throw new Error('Unexpected response from the server.')
        }

        setProperties(data)
      } catch {
        if (!controller.signal.aborted) {
          setError('Could not load stays. Please try refreshing the page.')
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    loadProperties()

    return () => controller.abort()
  }, [])

function handleFilter(event) {
  event.preventDefault()

  const formData = new FormData(event.currentTarget)
  const params = new URLSearchParams(searchParams)

  const selectedLocation = formData.get('location').trim()
  const selectedGuests = formData.get('guests')

  if (selectedLocation) {
    params.set('location', selectedLocation)
  } else {
    params.delete('location')
  }

  params.set('guests', selectedGuests)
  setSearchParams(params)
}



  const matchingProperties = properties.filter((property) => {
    const matchesLocation = property.location
      .toLowerCase()
      .includes(location.toLowerCase())

    const fitsGuests = property.guests >= guestCount

    return matchesLocation && fitsGuests
  })

  return (
    <>
    <Header />
    <main className="search-results-page">
      <Link to="/">← Back to home</Link>

      <h1>Stays in {location || 'all locations'}</h1>
      <form
  key={searchParams.toString()}
  className="search-bar"
  onSubmit={handleFilter}
>
  <label className="search-field">
    <span>Location</span>
    <input
      type="text"
      name="location"
      placeholder="All locations"
      defaultValue={location}
    />
  </label>

  <label className="search-field">
    <span>Guests</span>
    <input
      type="number"
      name="guests"
      min="1"
      step="1"
      defaultValue={guestCount}
      required
    />
  </label>

  <button className="search-button" type="submit">
    Search
  </button>

  <button
    className="profile-button"
    type="button"
    onClick={() => setSearchParams({})}
  >
    Clear filters
  </button>
</form>


      {loading && <p role="status">Loading stays...</p>}
      {error && <p role="alert">{error}</p>}

      {!loading && !error && (
        <>
          <p>{matchingProperties.length} properties found</p>

          {matchingProperties.length === 0 && (
            <p>No matching stays. Try another location or fewer guests.</p>
          )}

          <div className="results-list">
            {matchingProperties.map((property) => (
              <article className="result-card" key={property._id}>
                <img
                  className="result-image"
                  src={imageUrl(property.image)}
                  alt={`Sample accommodation for ${property.title}`}
                  loading="lazy"
                />

                <div className="result-details">
                  <p>{property.type} in {property.location}</p>

                  <h2>
                    <Link
                      to={`/properties/${property._id}?${searchParams.toString()}`}
                    >
                      {property.title}
                    </Link>
                  </h2>

                  <p>
                    Up to {property.guests} guests · {property.bedrooms}{' '}
                    {property.bedrooms === 1 ? 'bedroom' : 'bedrooms'}
                  </p>

                  <p>{property.amenities}</p>

                  <div className="result-bottom">
                    <span>New listing</span>
                    <p className="result-price">
                      <strong>R{property.price}</strong> / night
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </main>
  </>
  )
}

export default SearchResults