
import { useRef, useState } from 'react'
import ImageUpload from './ImageUpload'

const API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV
    ? 'http://localhost:5000'
    : window.location.origin)

function PropertyForm({ property, onSaved, onCancel }) {
  const [form, setForm] = useState({
    title: property?.title || '',
    location: property?.location || '',
    type: property?.type || 'Entire apartment',
    description: property?.description || '',
    guests: property?.guests ?? 1,
    bedrooms: property?.bedrooms ?? 1,
    bathrooms: property?.bathrooms ?? 1,
    price: property?.price ?? '',
    amenities: property?.amenities || '',
    image: property?.image || '',
    images: (property?.images || []).join('\n'),
  })

  const [amenityInput, setAmenityInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const inProgress = useRef(false)

  function handleChange(event) {
    const { name, value } = event.target
    setForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  function addAmenity() {
    const value = amenityInput.trim()
    if (!value) return

    setForm((current) => {
      const existing = current.amenities
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)

      if (existing.some((item) =>
        item.toLowerCase() === value.toLowerCase()
      )) {
        return current
      }

      return {
        ...current,
        amenities: [...existing, value].join(', '),
      }
    })

    setAmenityInput('')
  }

  function removeAmenity(amenity) {
    setForm((current) => ({
      ...current,
      amenities: current.amenities
        .split(',')
        .map((item) => item.trim())
        .filter((item) => item && item !== amenity)
        .join(', '),
    }))
  }

  function handleUploaded(path) {
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

      if (!coverImage) {
        throw new Error('Please upload or enter a cover image.')
      }

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
        bathrooms: Number(form.bathrooms),
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
        throw new Error(
          data.message || 'Unable to save the property.'
        )
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

  const amenities = form.amenities
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)

  const imagePreview = form.image.trim()
    ? `${API_URL}${form.image.startsWith('/') ? '' : '/'}${form.image}`
    : ''

  return (
    <section className="listing-form-card">
      <h2>{property ? 'Update Listing' : 'Create Listing'}</h2>

      <form onSubmit={handleSubmit}>
        <fieldset disabled={saving} className="listing-fieldset">
          <div className="listing-form-grid">
            <div className="listing-form-column">
              <label htmlFor="listing-title">Listing Name</label>
              <input
                id="listing-title"
                name="title"
                value={form.title}
                onChange={handleChange}
                required
              />

              <label htmlFor="listing-location">
                Location
              </label>
              <input
                id="listing-location"
                name="location"
                value={form.location}
                onChange={handleChange}
                required
              />

              <label htmlFor="listing-description">
                Description
              </label>
              <textarea
                id="listing-description"
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={6}
              />
            </div>

            <div className="listing-form-column">
              <div className="listing-number-row">
                <div>
                  <label htmlFor="listing-bedrooms">
                    Rooms
                  </label>
                  <input
                    id="listing-bedrooms"
                    name="bedrooms"
                    type="number"
                    min="0"
                    step="1"
                    value={form.bedrooms}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="listing-bathrooms">
                    Baths
                  </label>
                  <input
                    id="listing-bathrooms"
                    name="bathrooms"
                    type="number"
                    min="0"
                    step="1"
                    value={form.bathrooms}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <label htmlFor="listing-type">Type</label>
              <select
                id="listing-type"
                name="type"
                value={form.type}
                onChange={handleChange}
                required
              >
                {![
                  'Entire apartment',
                  'Entire home',
                  'Private room',
                  'Shared room',
                  'Hotel room',
                ].includes(form.type) && (
                  <option value={form.type}>
                    {form.type}
                  </option>
                )}
                <option value="Entire apartment">
                  Entire apartment
                </option>
                <option value="Entire home">
                  Entire home
                </option>
                <option value="Private room">
                  Private room
                </option>
                <option value="Shared room">
                  Shared room
                </option>
                <option value="Hotel room">
                  Hotel room
                </option>
              </select>

              <label htmlFor="listing-guests">
                Maximum Guests
              </label>
              <input
                id="listing-guests"
                name="guests"
                type="number"
                min="1"
                step="1"
                value={form.guests}
                onChange={handleChange}
                required
              />

              <label htmlFor="listing-price">
                Price per Night (R)
              </label>
              <input
                id="listing-price"
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={handleChange}
                required
              />

              <label htmlFor="listing-amenity">
                Amenities
              </label>
              <div className="listing-amenity-row">
                <input
                  id="listing-amenity"
                  value={amenityInput}
                  onChange={(event) =>
                    setAmenityInput(event.target.value)
                  }
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault()
                      addAmenity()
                    }
                  }}
                  placeholder="e.g. WiFi"
                />
                <button
                  type="button"
                  className="listing-blue-button"
                  onClick={addAmenity}
                >
                  Add
                </button>
              </div>

              <div className="listing-amenities">
                {amenities.map((amenity) => (
                  <span
                    className="listing-amenity-tag"
                    key={amenity}
                  >
                    {amenity}
                    <button
                      type="button"
                      onClick={() => removeAmenity(amenity)}
                      aria-label={`Remove ${amenity}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="listing-images-section">
            <label>Images</label>

            <ImageUpload
              disabled={saving}
              onUploaded={handleUploaded}
            />

            {imagePreview && (
              <img
                src={imagePreview}
                alt="Listing cover preview"
                className="listing-image-preview"
              />
            )}

            <label htmlFor="listing-cover-image">
              Cover Image Path
            </label>
            <input
              id="listing-cover-image"
              name="image"
              value={form.image}
              onChange={handleChange}
              placeholder="/images/property.jpg"
              required
            />

            <label htmlFor="listing-gallery-images">
              Additional Image Paths
            </label>
            <textarea
              id="listing-gallery-images"
              name="images"
              value={form.images}
              onChange={handleChange}
              rows={3}
              placeholder="One image path per line"
            />
          </div>

          <div className="listing-form-actions">
            <button
              type="submit"
              className="listing-blue-button"
            >
              {saving
                ? 'Saving…'
                : property
                  ? 'Update'
                  : 'Create'}
            </button>

            <button
              type="button"
              className="listing-red-button"
              onClick={onCancel}
            >
              Cancel
            </button>
          </div>
        </fieldset>

        {error && <p role="alert">{error}</p>}
      </form>
    </section>
  )
}

export default PropertyForm
