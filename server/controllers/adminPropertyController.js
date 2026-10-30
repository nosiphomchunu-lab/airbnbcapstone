const Property = require('../models/Property')
const Reservation = require('../models/Reservation')

function getPropertyFields(body) {
  const allowedFields = [
    'title',
    'location',
    'type',
    'description',
    'guests',
    'bedrooms',
    'price',
    'amenities',
    'image',
    'images',
  ]

  const fields = {}

  for (const field of allowedFields) {
    if (Object.prototype.hasOwnProperty.call(body, field)) {
      fields[field] = body[field]
    }
  }

  return fields
}

function sendError(res, error) {
  if (
    error.name === 'ValidationError' ||
    error.name === 'CastError'
  ) {
    return res.status(400).json({
      message: 'Check the property fields and enter valid values.',
    })
  }

  return res.status(500).json({
    message: 'Unable to save the property. Please try again.',
  })
}

async function createProperty(req, res) {
  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
    return res.status(400).json({
      message: 'Property details are required.',
    })
  }

  try {
    const fields = getPropertyFields(req.body)
    const property = await Property.create(fields)

    return res.status(201).json(property)
  } catch (error) {
    return sendError(res, error)
  }
}

async function updateProperty(req, res) {
  const { id } = req.params

  if (!/^[a-fA-F0-9]{24}$/.test(id)) {
    return res.status(400).json({
      message: 'Invalid property ID.',
    })
  }

  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
    return res.status(400).json({
      message: 'Property details are required.',
    })
  }

  try {
    const property = await Property.findById(id)

    if (!property) {
      return res.status(404).json({
        message: 'Property not found.',
      })
    }

    const fields = getPropertyFields(req.body)
    property.set(fields)
    await property.save()

    return res.json(property)
  } catch (error) {
    return sendError(res, error)
  }
}

async function deleteProperty(req, res) {
  const { id } = req.params

  if (!/^[a-fA-F0-9]{24}$/.test(id)) {
    return res.status(400).json({
      message: 'Invalid property ID.',
    })
  }

  try {
    const hasReservations = await Reservation.exists({
      property: id,
    })

    if (hasReservations) {
      return res.status(409).json({
        message:
          'This property has reservations and cannot be deleted.',
      })
    }

    const property = await Property.findByIdAndDelete(id)

    if (!property) {
      return res.status(404).json({
        message: 'Property not found.',
      })
    }

    return res.json({
      message: 'Property deleted successfully.',
      propertyId: id,
    })
  } catch {
    return res.status(500).json({
      message: 'Unable to delete the property. Please try again.',
    })
  }
}

module.exports = {
  createProperty,
  updateProperty,
  deleteProperty,
}