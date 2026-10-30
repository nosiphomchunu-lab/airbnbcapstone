const mongoose = require('mongoose')

const reservationSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
    },
    guestName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    guestEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 254,
    },
    checkIn: {
      type: Date,
      required: true,
    },
    checkOut: {
      type: Date,
      required: true,
      validate: {
        validator: function (value) {
          return value > this.checkIn
        },
        message: 'Check-out must be after check-in.',
      },
    },
    guests: {
      type: Number,
      required: true,
      min: 1,
      validate: {
        validator: Number.isInteger,
        message: 'Guests must be a whole number.',
      },
    },
    nights: {
      type: Number,
      required: true,
      min: 1,
    },
    nightlyPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    accommodation: {
      type: Number,
      required: true,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    cleaningFee: {
      type: Number,
      required: true,
      min: 0,
    },
    serviceFee: {
      type: Number,
      required: true,
      min: 0,
    },
    taxes: {
      type: Number,
      required: true,
      min: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['confirmed', 'cancelled'],
      default: 'confirmed',
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Reservation', reservationSchema)