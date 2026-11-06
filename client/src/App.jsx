
import { useState } from 'react'
import './App.css'
import Footer from './components/Footer'
import { Link, useNavigate } from 'react-router-dom'
import Header from './components/Header'

function App() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('Beach')

 

const getaways = {
  Beach: ['Umdloti', 'Margate', 'Coffee Bay', 'Wilderness'],
  City: ['Bloemfontein', 'Polokwane', 'Mbombela', 'Stellenbosch'],
  Nature: ['Underberg', 'Sabie', 'Golden Gate', 'Tsitsikamma'],
}

  
const destinations = [
  {
    name: 'Sandton City Hotel',
    description: '53 km away',
    location: 'Sandton',
    image: '/images/sandton-city-hotel.avif',
    color: '#cc2d4a',
  },
  {
    name: 'Joburg City Hotel',
    description: '168 km away',
    location: 'Johannesburg',
    image: '/images/joburg-city.avif',
    color: '#bc1a6e',
  },
  {
    name: 'Woodmead Hotel',
    description: '30 miles away',
    location: 'Woodmead',
    image: '/images/woodmead.avif',
    color: '#de3151',
  },
  {
    name: 'Hyde Park Hotel',
    description: '34 km away',
    location: 'Hyde Park',
    image: '/images/hyde-park-hotel.avif',
    color: '#d93b30',
  },
]


  function handleSearch(event) {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const location = String(formData.get('location') || '').trim()

    const params = new URLSearchParams({
      location,
      checkIn: String(formData.get('checkIn') || ''),
      checkOut: String(formData.get('checkOut') || ''),
      guests: String(formData.get('guests') || '1'),
    })

    navigate(`/search?${params.toString()}`)
  }

  return (
    <>
      <Header />

      <main>
        <section id="stays">
          <form className="search-bar" onSubmit={handleSearch}>
            <label className="search-field">
              <span>Location</span>
              <input
                type="text"
                name="location"
                placeholder="Where are you going?"
              />
            </label>

            <label className="search-field">
              <span>Check in</span>
              <input type="date" name="checkIn" />
            </label>

            <label className="search-field">
              <span>Check out</span>
              <input type="date" name="checkOut" />
            </label>

            <label className="search-field">
              <span>Guests</span>
              <input
                type="number"
                name="guests"
                min="1"
                defaultValue="1"
              />
            </label>

            <button className="search-button" type="submit">
              Search
            </button>
          </form>
        </section>

        <section className="hero-banner">
          <div className="hero-content">
            <h1>Not sure where to go? Perfect.</h1>

            <a className="hero-button" href="#destinations">
              I'm flexible
            </a>
          </div>
        </section>

        <section
          id="destinations"
          className="destinations-section"
        >
          <h2>Inspiration for your next trip</h2>

          <div className="destination-grid">
            {destinations.map((destination) => (
              <article
                className="destination-card"
                key={destination.name}
                style={{
                  backgroundColor: destination.color,
                }}
              >
                <Link
                  to={`/search?location=${encodeURIComponent(destination.location)}`}
                  className="destination-card-link"
                >
                  <img
                    src={destination.image}
                    alt={destination.name}
                    loading="lazy"
                  />

                  <div className="destination-card-content">
                    <h3>{destination.name}</h3>
                    <p>{destination.description}</p>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section
          id="experiences"
          className="experiences-section"
        >
          <h2>Discover Airbnb Experiences</h2>

          <div className="experiences-grid">
            <article className="experience-card experience-trip">
              <h3>
                Things to do
                <br />
                on your trip
              </h3>

              <a
                href="#destinations"
                className="experience-button"
              >
                Experiences
              </a>
            </article>

            <article className="experience-card experience-home">
              <h3>
                Things to do
                <br />
                from home
              </h3>

              <a
                href="#getaways"
                className="experience-button"
              >
                Online Experiences
              </a>
            </article>
          </div>
        </section>

        <section className="gift-section">
          <div className="gift-content">
            <h2>
              Shop Airbnb
              <br />
              gift cards
            </h2>

            <a href="#getaways" className="gift-button">
              Learn more
            </a>
          </div>

          <div className="gift-cards-display">
            <div className="gift-card gift-card-left">
              <span className="gift-card-logo">◇</span>
            </div>

            <div className="gift-card gift-card-center">
              <span className="gift-card-logo">◇</span>
            </div>

            <div className="gift-card gift-card-right">
              <span className="gift-card-logo">◇</span>
            </div>
          </div>
        </section>

        <section className="hosting-banner">
          <div className="hosting-content">
            <h2>
              Questions
              <br />
              about
              <br />
              hosting?
            </h2>

            <a
              className="experience-button"
              href="#hosting-help"
            >
              Ask a Superhost
            </a>
          </div>
        </section>

        <details
          id="hosting-help"
          className="hosting-help"
        >
          <summary>Learn about hosting</summary>

          <p>
            Administrators can create a listing, upload photos,
            set a nightly price, and manage reservations through
            the admin dashboard. Guests can browse stays and
            make a demonstration reservation. No payments
            are collected.
          </p>
        </details>

        <section
          id="getaways"
          className="getaways-section"
        >
          <h2>Inspiration for future getaways</h2>

          <div
            className="getaway-tabs"
            aria-label="Getaway categories"
          >
            {Object.keys(getaways).map((tab) => (
              <button
                key={tab}
                type="button"
                className={
                  activeTab === tab
                    ? 'getaway-tab active'
                    : 'getaway-tab'
                }
                aria-pressed={activeTab === tab}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          <ul className="getaway-list">
            {getaways[activeTab].map((place) => (
              <li key={place}>
                <Link
                  to={`/search?location=${encodeURIComponent(place)}`}
                >
                  <strong>{place}</strong>
                </Link>

                <span>South Africa</span>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <Footer />
    </>
  )
}

export default App
