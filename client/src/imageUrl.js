const API_URL = (
  import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : window.location.origin)
).replace(/\/$/, '')

export default function imageUrl(path) {
  if (!path) return ''

  return path.startsWith('/api/images/')
    ? `${API_URL}${path}`
    : path
}