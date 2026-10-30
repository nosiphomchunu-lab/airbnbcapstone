import { useRef, useState } from 'react'
import ImageUpload from './ImageUpload'

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : window.location.origin)

function PropertyForm({ property, onSaved, onCancel }) {
  const [form, setForm] = useState({
    title: property?.title || '',
    location: property?.location || '',
    type: property?.type || 'Entire apartment',
    description: property?.description || '',
    guests: property?.guests ?? 1,
    bedrooms: property?.bedrooms ?? 1,
    price: property?.price ?? '',
    amenities: property?.amenities || '',
    image: property?.image || '',
    images: (property?.images || []).join('\n'),
  })

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const inProgress = useRef(false)

  function handleChange(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

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

      const coverImage = form.image.trim()
      const galleryImages = form.images
        .split('\n')
        .map((image) => image.trim())
        .filter(Boolean)

      const details = {
        title: form.title.trim(),
        location: form.location.trim(),
        type: form.type.trim(),
        description: form.description.trim(),
        guests: Number(form.guests),
        bedrooms: Number(form.bedrooms),
        price: Number(form.price),
        amenities: form.amenities.trim(),
        image: coverImage,
        images: [...new Set([coverImage, ...galleryImages])],
      }

      const endpoint = property
        ? `/api/admin/properties/${property._id}`
        : '/api/admin/properties'

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: property ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(details),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Unable to save the property.')
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
      <h2>{property ? 'Edit property' : 'Add a property'}</h2>

      <form className="login-form" onSubmit={handleSubmit}>
        <fieldset disabled={saving}>
          <legend>Property details</legend>

          {[
            ['title', 'Property title'],
            ['location', 'Location'],
            ['type', 'Property type'],
            ['amenities', 'Amenities'],
            ['image', 'Cover image path'],
          ].map(([name, label]) => (
            <p key={name}>
              <label htmlFor={`property-${name}`}>{label}</label>
              <input
                id={`property-${name}`}
                name={name}
                value={form[name]}
                onChange={handleChange}
                required={name !== 'amenities'}
                type="text"
              />
            </p>
          ))}

          {[
            ['guests', 'Maximum guests', 1, '1'],
            ['bedrooms', 'Bedrooms', 0, '1'],
            ['price', 'Price per night (R)', 0, '0.01'],
          ].map(([name, label, min, step]) => (
            <p key={name}>
              <label htmlFor={`property-${name}`}>{label}</label>
              <input
                id={`property-${name}`}
                name={name}
                type="number"
                min={min}
                step={step}
                value={form[name]}
                onChange={handleChange}
                required
              />
            </p>
          ))}

          <p>
            <label htmlFor="property-description">Description</label>
            <textarea
              id="property-description"
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
            />
          </p>

          <p>
            <label htmlFor="property-images">
              Additional image paths — one per line
            </label>
            <textarea
              id="property-images"
              name="images"
              value={form.images}
              onChange={handleChange}
              rows={5}
              placeholder="/images/durban-apartment-2.jpg"
            />
          </p>

           <p>
  Upload a photo below. The newest upload becomes the cover photo.
  Earlier photos remain in the gallery.
</p>

  <ImageUpload
  disabled={saving}
  onUploaded={(path) => {
    setForm((current) => {
      const existingImages = current.images
        .split('\n')
        .map((image) => image.trim())
        .filter(Boolean)

      const gallery = [
        path,
        current.image.trim(),
        ...existingImages,
      ].filter(Boolean)

      return {
        ...current,
        image: path,
        images: [...new Set(gallery)].join('\n'),
      }
    })
  }}
  />

          <button className="search-button" type="submit">
            {saving ? 'Saving…' : 'Save property'}
          </button>

          <button type="button" onClick={onCancel}>
            Cancel
          </button>
        </fieldset>

        {error && <p role="alert">{error}</p>}
      </form>
    </section>
  )
}

export default PropertyForm