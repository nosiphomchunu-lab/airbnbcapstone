const Property = require('../models/Property')
const Reservation = require('../models/Reservation')

function parseDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null
  }

  const date = new Date(`${value}T00:00:00.000Z`)

  if (
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== value
  ) {
    return null
  }

  return date
}

function roundMoney(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

async function createReservation(req, res) {
  try {
    const {
      propertyId,
      guestName,
      guestEmail,
      checkIn,
      checkOut,
      guests,
    } = req.body || {}

    if (
      typeof propertyId !== 'string' ||
      !/^[a-fA-F0-9]{24}$/.test(propertyId)
    ) {
      return res.status(400).json({ message: 'Choose a valid property.' })
    }

    if (
      typeof guestName !== 'string' ||
      !guestName.trim() ||
      guestName.trim().length > 100
    ) {
      return res.status(400).json({ message: 'Enter your name.' })
    }

    if (
      typeof guestEmail !== 'string' ||
      guestEmail.trim().length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail.trim())
    ) {
      return res.status(400).json({
        message: 'Enter a valid email address.',
      })
    }

    const arrival = parseDate(checkIn)
    const departure = parseDate(checkOut)

    const today = new Intl.DateTimeFormat('sv-SE', {
      timeZone: 'Africa/Johannesburg',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date())

    if (
      !arrival ||
      !departure ||
      checkIn < today ||
      departure <= arrival
    ) {
      return res.status(400).json({
        message: 'Choose valid future dates with check-out after check-in.',
      })
    }

    const nights = (departure - arrival) / 86400000

    if (nights > 365) {
      return res.status(400).json({
        message: 'A reservation cannot exceed 365 nights.',
      })
    }

    const property = await Property.findById(propertyId)

    if (!property) {
      return res.status(404).json({ message: 'Property not found.' })
    }

    if (
      !Number.isInteger(guests) ||
      guests < 1 ||
      guests > property.guests
    ) {
      return res.status(400).json({
        message: `Choose between 1 and ${property.guests} guests.`,
      })
    }

    const overlappingReservation = await Reservation.findOne({
      property: propertyId,
      status: 'confirmed',
      checkIn: { $lt: departure },
      checkOut: { $gt: arrival },
    })

    if (overlappingReservation) {
      return res.status(409).json({
        message: 'This property is already booked for those dates.',
      })
    }

    // Sample pricing rules for this assignment.
    const accommodation = roundMoney(nights * property.price)
    const discount =
      nights >= 7 ? roundMoney(accommodation * 0.1) : 0
    const cleaningFee = 150
    const serviceFee = roundMoney((accommodation - discount) * 0.1)
    const subtotal = roundMoney(
      accommodation - discount + cleaningFee + serviceFee
    )
    const taxes = roundMoney(subtotal * 0.15)
    const total = roundMoney(subtotal + taxes)

    const reservation = await Reservation.create({
      property: property._id,
      guestName: guestName.trim(),
      guestEmail: guestEmail.trim().toLowerCase(),
      checkIn: arrival,
      checkOut: departure,
      guests,
      nights,
      nightlyPrice: property.price,
      accommodation,
      discount,
      cleaningFee,
      serviceFee,
      taxes,
      total,
    })

    return res.status(201).json({
      message: 'Reservation confirmed. No payment has been taken.',
      reservationId: reservation._id,
      total: reservation.total,
    })
  } catch {
    return res.status(500).json({
      message: 'Unable to save your reservation. Please try again.',
    })
  }
}

async function updateReservation(req, res) {
  const { id } = req.params

  if (!/^[a-fA-F0-9]{24}$/.test(id)) {
    return res.status(400).json({
      message: 'Invalid reservation ID.',
    })
  }

  const { guestName, guestEmail, guests } = req.body || {}

  if (
    typeof guestName !== 'string' ||
    !guestName.trim() ||
    guestName.trim().length > 100
  ) {
    return res.status(400).json({
      message: 'Enter a guest name of up to 100 characters.',
    })
  }

  if (
    typeof guestEmail !== 'string' ||
    guestEmail.trim().length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail.trim())
  ) {
    return res.status(400).json({
      message: 'Enter a valid email address.',
    })
  }

  try {
    const reservation = await Reservation.findById(id)

    if (!reservation) {
      return res.status(404).json({
        message: 'Reservation not found.',
      })
    }

    const property = await Property.findById(reservation.property)

    if (!property) {
      return res.status(404).json({
        message: 'The property for this reservation is unavailable.',
      })
    }

    if (
      !Number.isInteger(guests) ||
      guests < 1 ||
      guests > property.guests
    ) {
      return res.status(400).json({
        message: `Choose between 1 and ${property.guests} guests.`,
      })
    }

    // Only guest details change. Dates and agreed pricing stay intact.
    reservation.guestName = guestName.trim()
    reservation.guestEmail = guestEmail.trim().toLowerCase()
    reservation.guests = guests

    await reservation.save()
    await reservation.populate('property', 'title location')

    return res.json(reservation)
  } catch {
    return res.status(500).json({
      message: 'Unable to update the reservation. Please try again.',
    })
  }
}

async function deleteReservation(req, res) {
  const { id } = req.params

  if (!/^[a-fA-F0-9]{24}$/.test(id)) {
    return res.status(400).json({
      message: 'Invalid reservation ID.',
    })
  }

  try {
    const reservation = await Reservation.findByIdAndDelete(id)

    if (!reservation) {
      return res.status(404).json({
        message: 'Reservation not found.',
      })
    }

    return res.json({
      message: 'Reservation deleted successfully.',
      reservationId: id,
    })
  } catch {
    return res.status(500).json({
      message: 'Unable to delete the reservation. Please try again.',
    })
  }
}

module.exports = {
  createReservation,
  updateReservation,
  deleteReservation,
}