const mongoose = require('mongoose')

const propertySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    guests: {
      type: Number,
      required: true,
      min: 1,
      validate: {
        validator: Number.isInteger,
        message: 'Guests must be a whole number',
      },
    },
    bedrooms: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: 'Bedrooms must be a whole number',
      },
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    amenities: {
      type: String,
      default: '',
    },
    image: {
      type: String,
      required: true,
    },
    images: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Property', propertySchema)