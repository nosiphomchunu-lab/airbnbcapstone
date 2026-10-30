const Property = require('../models/Property')

async function getProperties(req, res) {
  try {
    const properties = await Property.find().sort({ createdAt: 1 })
    res.json(properties)
  } catch {
    res.status(500).json({
      message: 'Unable to load properties. Please try again.',
    })
  }
}

async function getPropertyById(req, res) {
  const { id } = req.params

  if (!/^[a-fA-F0-9]{24}$/.test(id)) {
    return res.status(400).json({
      message: 'Invalid property ID.',
    })
  }

  try {
    const property = await Property.findById(id)

    if (!property) {
      return res.status(404).json({
        message: 'Property not found.',
      })
    }

    res.json(property)
  } catch {
    res.status(500).json({
      message: 'Unable to load this property. Please try again.',
    })
  }
}

module.exports = { getProperties, getPropertyById }