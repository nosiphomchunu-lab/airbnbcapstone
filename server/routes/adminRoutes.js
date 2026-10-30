const express = require('express')
const Property = require('../models/Property')
const Reservation = require('../models/Reservation')
const { protect, requireAdmin,} = require('../middleware/authMiddleware')
const { updateReservation, deleteReservation, } = require('../controllers/reservationController')
const router = express.Router()
const { createProperty, updateProperty, deleteProperty, } = require('../controllers/adminPropertyController')

router.use(protect, requireAdmin)
router.put('/reservations/:id', updateReservation)
router.delete('/reservations/:id', deleteReservation)
router.post('/properties', createProperty)
router.put('/properties/:id', updateProperty)
router.delete('/properties/:id', deleteProperty)

router.get('/properties', async (req, res) => {
  try {
    const properties = await Property.find().sort({ createdAt: -1 })
    res.json(properties)
  } catch {
    res.status(500).json({
      message: 'Unable to load properties.',
    })
  }
})

router.get('/reservations', async (req, res) => {
  try {
    const reservations = await Reservation.find()
      .populate('property', 'title location')
      .sort({ createdAt: -1 })

    res.json(reservations)
  } catch {
    res.status(500).json({
      message: 'Unable to load reservations.',
    })
  }
})

module.exports = router