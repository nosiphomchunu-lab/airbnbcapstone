import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const API_URL =
  import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : window.location.origin)

function Login() {
  const navigate = useNavigate()
  const [isRegistering, setIsRegistering] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const requestInProgress = useRef(false)

  async function handleSubmit(event) {
    event.preventDefault()

    if (requestInProgress.current) return

    setMessage('')
    requestInProgress.current = true
    setSubmitting(true)

    try {
      const endpoint = isRegistering ? 'register' : 'login'

      const response = await fetch(`${API_URL}/api/auth/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...(isRegistering ? { name: name.trim() } : {}),
          email: email.trim(),
          password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Unable to sign in.')
      }

      if (!data.token || !data.user) {
        throw new Error('Unexpected response from the server.')
      }

      
      sessionStorage.setItem('token', data.token)
      sessionStorage.setItem('user', JSON.stringify(data.user))

      setPassword('')
      navigate(data.user.role === 'admin' ? '/admin' : '/', {
      replace: true,
      })
    } catch (error) {
      setMessage(
        error instanceof TypeError
          ? 'Could not reach the server. Check that your backend is running.'
          : error.message
      )
    } finally {
      requestInProgress.current = false
      setSubmitting(false)
    }
  }

  function switchMode() {
    setIsRegistering(!isRegistering)
    setMessage('')
    setPassword('')
  }

  return (
    <main className="login-page">
      <Link to="/">← Back to home</Link>

      <h1>{isRegistering ? 'Create an account' : 'Log in'}</h1>
      <p>
        {isRegistering
          ? 'Create an account to get started.'
          : 'Welcome back to your Airbnb clone.'}
      </p>

      <form className="login-form" onSubmit={handleSubmit}>
        {isRegistering && (
          <>
            <label htmlFor="name">Full name</label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              maxLength={100}
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              disabled={submitting}
            />
          </>
        )}

        <label htmlFor="email">Email address</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          maxLength={254}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          disabled={submitting}
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete={
            isRegistering ? 'new-password' : 'current-password'
          }
          minLength={isRegistering ? 8 : undefined}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          disabled={submitting}
        />

        {isRegistering && <p>Use at least 8 characters.</p>}

        <button type="submit" disabled={submitting}>
          {submitting
            ? 'Please wait...'
            : isRegistering
              ? 'Create account'
              : 'Log in'}
        </button>

        {message && <p role="alert">{message}</p>}
      </form>

      <p>
        {isRegistering
          ? 'Already have an account?'
          : 'Don’t have an account?'}
      </p>

      <button
        type="button"
        onClick={switchMode}
        disabled={submitting}
      >
        {isRegistering ? 'Log in instead' : 'Create an account'}
      </button>
    </main>
  )
}

export default Login