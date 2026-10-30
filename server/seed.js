const dns = require('node:dns')
dns.setServers(['8.8.8.8', '8.8.4.4'])

const mongoose = require('mongoose')
const path = require('path')
const Property = require('./models/Property')
const properties = require('./data/properties')

require('dotenv').config({
  path: path.join(__dirname, '.env'),
})

async function seedProperties() {
  try {
    const { MONGO_URI, MONGO_PASSWORD } = process.env

    if (!MONGO_URI || !MONGO_PASSWORD) {
      throw new Error('Missing database settings in server/.env')
    }

    const connectionString = MONGO_URI.replace(
      '<db_password>',
      encodeURIComponent(MONGO_PASSWORD)
    )

    await mongoose.connect(connectionString, {
    dbName: 'airbnb_capstone',
    serverSelectionTimeoutMS: 15000,
    family: 4,
    })

    console.log('MongoDB connected')

    let added = 0

    for (const property of properties) {
      const existing = await Property.findOne({
        title: property.title,
        location: property.location,
      })

      if (!existing) {
        await Property.create(property)
        added += 1
      }
    }

    console.log(`Finished: ${added} new properties added.`)
    } catch (error) {
    console.error('Could not finish importing properties.')
    console.error('Error type:', error.name)
    console.error('Details:', error.message)
    console.error('Cause:', error.cause?.message || 'Not provided')
    console.error('Error code:', error.code || 'Not provided')

    if (error.name === 'ValidationError') {
      for (const issue of Object.values(error.errors)) {
        console.error(`${issue.path}: ${issue.message}`)
      }
    }

    process.exitCode = 1
  } finally {
    await mongoose.disconnect()
  }
}

seedProperties()