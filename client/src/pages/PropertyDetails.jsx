import { useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import '../App.css'
import BookingForm from '../components/BookingForm'
import imageUrl from '../imageUrl'
import Header from '../components/Header'
import Footer from '../components/Footer'

const API_URL =
  import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : window.location.origin)

function PropertyDetails() {
  const { id } = useParams()

  return (
    <>
      <Header />
      <PropertyContent key={id} id={id} />
      <Footer />
    </>
  )
}

function PropertyContent({ id }) {
  const [searchParams] = useSearchParams()
  const [property, setProperty] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    async function loadProperty() {
      try {
        const response = await fetch(
          `${API_URL}/api/properties/${encodeURIComponent(id)}`,
          { signal: controller.signal }
        )

        if (response.status === 404 || response.status === 400) {
          throw new Error('Property not found.')
        }

        if (!response.ok) {
          throw new Error('Unable to load this property.')
        }

        const data = await response.json()

        if (!controller.signal.aborted) {
          setProperty(data)
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setError(error.message || 'Unable to load this property.')
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    loadProperty()

    return () => controller.abort()
  }, [id])

  if (loading) {
    return (
      <main className="property-page">
        <p role="status">Loading property...</p>
      </main>
    )
  }

  if (error || !property) {
    return (
      <main className="property-page">
        <h1>Unable to display this stay</h1>
        <p role="alert">{error || 'Property not found.'}</p>
        <Link to="/search">← Back to stays</Link>
      </main>
    )
  }

  const backParams = new URLSearchParams(searchParams)

  if (!backParams.has('location')) {
    backParams.set('location', property.location)
  }

  const images = (
    property.images?.length ? property.images : [property.image]
  ).filter(Boolean)

  const amenities = (property.amenities || '')
    .split(/·|,/)
    .map((amenity) => amenity.trim())
    .filter(Boolean)

  return (
    <main className="property-page">
      <Link to={`/search?${backParams.toString()}`}>
        ← Back to search results
      </Link>

      <h1>{property.title}</h1>
      <p>{property.location}, South Africa · New listing</p>

      <div className="property-gallery">
        {images.map((image, index) => (
          <img
            key={`${image}-${index}`}
            src={imageUrl(image)}
            alt={`${property.title} — photo ${index + 1}`}
            loading={index === 0 ? 'eager' : 'lazy'}
          />
        ))}
      </div>

      <div className="stay-layout">
        <div>
          <section className="stay-section">
            <h2>{property.type}</h2>
            <p>
              Up to {property.guests} guests · {property.bedrooms}{' '}
              {property.bedrooms === 1 ? 'bedroom' : 'bedrooms'}
            </p>
            <p>
              {property.description ||
                `Explore ${property.location} from this ${property.type.toLowerCase()}.`}
            </p>
          </section>

          <section className="stay-section">
            <h2>Where you’ll sleep</h2>
            <div className="sleeping-card">
              <h3>
                {property.bedrooms === 0
                  ? 'Studio sleeping area'
                  : `${property.bedrooms} ${
                      property.bedrooms === 1 ? 'bedroom' : 'bedrooms'
                    }`}
              </h3>
              <p>Space for up to {property.guests} guests.</p>
              <p>Bed arrangements are not specified.</p>
            </div>
          </section>

          <section className="stay-section">
            <h2>What this place offers</h2>

            {amenities.length > 0 ? (
              <ul className="stay-amenities">
                {amenities.map((amenity, index) => (
                  <li key={`${amenity}-${index}`}>{amenity}</li>
                ))}
              </ul>
            ) : (
              <p>No amenities listed yet.</p>
            )}
          </section>
        </div>

        <aside className="stay-booking" aria-label="Reserve this stay">
          <BookingForm key={property._id} property={property} />
        </aside>
      </div>

      <section className="stay-section">
        <h2>Reviews</h2>
        <p>No reviews yet.</p>
        <p>This is a new demo listing with no guest ratings.</p>
      </section>

      <section className="stay-section">
        <h2>Where you’ll be</h2>
        <h3>{property.location}, South Africa</h3>
        <p>
          Explore stays in {property.location} and choose a place
          that suits your trip. An exact address is not provided
          for this demo listing.
        </p>
        <Link
          to={`/search?location=${encodeURIComponent(property.location)}`}
        >
          Explore more stays in {property.location}
        </Link>
      </section>

      <section className="stay-section">
        <div className="host-heading">
          <span className="host-avatar" aria-hidden="true">H</span>
          <div>
            <h2>Your host</h2>
            <p>Capstone demo host</p>
          </div>
        </div>

        <p>
          This sample host profile is part of the student project.
          Reservations demonstrate the booking process; no payment
          is taken.
        </p>
      </section>

      <section className="stay-section">
        <h2>Things to know</h2>
        <p>Sample policies for this demo property.</p>

        <div className="stay-rules">
          <div>
            <h3>House rules</h3>
            <ul>
              <li>Check-in from 14:00</li>
              <li>Check-out before 10:00</li>
              <li>Maximum {property.guests} guests</li>
              <li>No smoking indoors</li>
              <li>No parties or events</li>
            </ul>
          </div>

          <div>
            <h3>Safety information</h3>
            <p>Smoke alarm information is not provided.</p>
            <p>Carbon monoxide alarm information is not provided.</p>
            <p>Confirm safety facilities before any real stay.</p>
          </div>

          <div>
            <h3>Cancellation</h3>
            <p>
              This project does not process payments or refunds.
              Demo reservations can be managed by an administrator.
            </p>
          </div>
        </div>
      </section>

      <section className="stay-section">
        <h2>Explore other destinations</h2>

        <div className="stay-destinations">
          {['Durban', 'Cape Town', 'Johannesburg', 'Drakensberg'].map(
            (place) => (
              <Link
                key={place}
                to={`/search?location=${encodeURIComponent(place)}`}
              >
                {place}
              </Link>
            )
          )}
        </div>
      </section>
    </main>
  )
}

export default PropertyDetails