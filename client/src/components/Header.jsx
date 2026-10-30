import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

function Header() {
  const navigate = useNavigate()

  const [user, setUser] = useState(() => {
    try {
      const token = sessionStorage.getItem('token')
      const savedUser = sessionStorage.getItem('user')

      return token && savedUser ? JSON.parse(savedUser) : null
    } catch {
      return null
    }
  })

  function handleLogout() {
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('user')
    setUser(null)
    navigate('/', { replace: true })
  }

  function closeMenu(event) {
    const menu = event.currentTarget.closest('details')
    if (menu) menu.open = false
  }

  return (
    <header className="site-header">
      <Link className="brand" to="/">airbnb</Link>

      <nav className="header-nav" aria-label="Main navigation">
        <Link to="/search">Places to stay</Link>
        <a href="/#experiences">Experiences</a>
      </nav>

      {user ? (
        <details className="profile-menu">
          <summary className="profile-button">
            Hello, {user.name}
          </summary>

          {user.role === 'admin' && (
            <>
              <Link
                className="profile-button"
                to="/admin?view=listings"
                onClick={closeMenu}
              >
                Admin dashboard
              </Link>

              <Link
                className="profile-button"
                to="/admin?view=reservations"
                onClick={closeMenu}
              >
                View reservations
              </Link>
            </>
          )}

          <button
            className="profile-button"
            type="button"
            onClick={handleLogout}
          >
            Log out
          </button>
        </details>
      ) : (
        <Link className="profile-button" to="/login">
          Log in
        </Link>
      )}
    </header>
  )
}

export default Header