import { useRef, useState } from 'react'

const API_URL = (
  import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : window.location.origin)
).replace(/\/$/, '')

function ImageUpload({ onUploaded, disabled = false }) {
  const inputRef = useRef(null)
  const inProgress = useRef(false)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')

  async function handleUpload() {
    if (inProgress.current || disabled) return

    const file = inputRef.current?.files?.[0]

    if (!file) {
      setMessage('Choose a photo first.')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage('Choose a photo smaller than 5 MB.')
      return
    }

    const token = sessionStorage.getItem('token')

    if (!token) {
      setMessage('Please log in again.')
      return
    }

    inProgress.current = true
    setUploading(true)
    setMessage('')

    try {
      const formData = new FormData()
      formData.append('image', file)

      const response = await fetch(`${API_URL}/api/images`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Upload failed.')
      }

      if (!data.path) {
        throw new Error('The server did not return an image path.')
      }

      onUploaded(data.path)
      inputRef.current.value = ''
      setMessage('Photo uploaded. Save the property to keep your changes.')
    } catch (error) {
      setMessage(
        error instanceof TypeError
          ? 'Cannot reach the server. Check that the backend is running.'
          : error.message
      )
    } finally {
      inProgress.current = false
      setUploading(false)
    }
  }

  return (
    <fieldset disabled={disabled || uploading}>
      <legend>Upload a property photo</legend>

      <label htmlFor="property-photo">Choose a photo</label>
      <input
        ref={inputRef}
        id="property-photo"
        type="file"
        accept="image/jpeg,image/png,image/webp"
      />

      <p>JPG, PNG, or WebP. Maximum size: 5 MB.</p>

      <button type="button" onClick={handleUpload}>
        {uploading ? 'Uploading…' : 'Upload photo'}
      </button>

      {message && <p role="status">{message}</p>}
    </fieldset>
  )
}

export default ImageUpload