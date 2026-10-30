import { useState } from 'react'
import './App.css'
import Footer from './components/Footer'
import { Link, useNavigate } from 'react-router-dom'
import Header from './components/Header'


function App() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('Beach')

  const getaways = {
    Beach: ['Durban', 'Ballito', 'Umhlanga', 'Plettenberg Bay'],
    City: ['Cape Town', 'Johannesburg', 'Pretoria', 'Gqeberha'],
    Nature: ['Drakensberg', 'Hazyview', 'Clarens', 'Graskop'],
  }

  function handleSearch(event) {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const location = formData.get('location').trim()

    const params = new URLSearchParams({
      location,
      checkIn: formData.get('checkIn'),
      checkOut: formData.get('checkOut'),
      guests: formData.get('guests'),
    })

    navigate(`/search?${params.toString()}`)
  }

  return (
    <>
      <Header />

      <main>
        <section id="stays">
          <h1 className="page-title">Find your next stay</h1>
          <p>Explore places to stay and plan your next trip.</p>

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
            <h2>Let your curiosity do the booking</h2>
            <a className="hero-button" href="#destinations">
              Explore stays
            </a>
          </div>
        </section>

          <section id="destinations" className="destinations-section">
          <h2>Inspiration for your next trip</h2>

          <div className="destination-grid">
            {[
              {
                name: 'Cape Town',
                description: 'Mountains and coastal escapes',
                image: 'photo-1580060839134-75a5edca2e99',
                color: '#cc2d4a',
              },
              {
                name: 'Durban',
                description: 'Explore the warm Indian Ocean coast',
                image: 'photo-1507525428034-b723cf961d3e',
                color: '#bc1a6e',
              },
              {
                name: 'Johannesburg',
                description: 'Discover a vibrant city getaway',
                image: 'photo-1480714378408-67cf0d13bc1b',
                color: '#de3151',
              },
              {
                name: 'Drakensberg',
                description: 'Unwind on a mountain retreat',
                image: 'photo-1464822759023-fed622ff2c3b',
                color: '#d93b30',
              },
            ].map((destination) => (
              <article
                className="destination-card"
                key={destination.name}
                style={{ backgroundColor: destination.color }}
              >
                <img
                  src={`https://images.unsplash.com/${destination.image}?auto=format&fit=crop&w=600&q=80`}
                  alt={`${destination.name} travel inspiration`}
                  loading="lazy"
                />

                <div className="destination-card-content">
                  
                  <h3>
                  <Link
                  to={`/search?location=${encodeURIComponent(destination.name)}`}
                  style={{ color: 'inherit', textDecoration: 'none' }}
                  >
                  {destination.name}
                  </Link>
                  </h3>

                  <p>{destination.description}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="experiences" className="experiences-section">
          <h2>Discover Airbnb Experiences</h2>

          <div className="experiences-grid">
            <article className="experience-card experience-trip">
              <h3>Things to do<br />on your trip</h3>
              <button type="button" className="experience-button">
                Experiences
              </button>
            </article>

            <article className="experience-card experience-home">
              <h3>Things to do<br />from home</h3>
              <button type="button" className="experience-button">
                Online Experiences
              </button>
            </article>
          </div>
        </section>


                <section className="gift-section">
          <div className="gift-content">
            <h2>Shop Airbnb gift cards</h2>
            <p>Give someone a memorable getaway.</p>
            <button type="button" className="gift-button">
              Learn more
            </button>
          </div>

          <div className="gift-card-preview">
            <span>airbnb</span>
            <strong>A world of possibilities</strong>
            <span>Gift card</span>
          </div>
        </section>

        <section className="hosting-banner">
  <h2>Questions about hosting?</h2>

  <a className="experience-button" href="#hosting-help">
    Learn about hosting
  </a>
</section>

<details id="hosting-help" className="hosting-help">
  <summary>How hosting works in this demo</summary>
  <p>
    Administrators can create a listing, upload photos, set a nightly
    price, and manage reservations through the admin dashboard.
    Guests can browse stays and make a demonstration reservation.
    No payments are collected.
  </p>
</details>

        <section className="getaways-section">
          <h2>Inspiration for future getaways</h2>

          <div className="getaway-tabs" aria-label="Getaway categories">
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
                
                  <Link to={`/search?location=${encodeURIComponent(place)}`}>
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