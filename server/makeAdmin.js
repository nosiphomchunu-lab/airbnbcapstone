const dns = require('node:dns')
dns.setServers(['8.8.8.8', '8.8.4.4'])

const mongoose = require('mongoose')
const path = require('path')
const User = require('./models/User')

require('dotenv').config({
  path: path.join(__dirname, '.env'),
})

async function makeAdmin() {
  try {
    const email = process.argv[2]?.trim().toLowerCase()

    if (!email) {
      throw new Error('Include the email you registered with.')
    }

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

    const user = await User.findOne({ email })

    if (!user) {
      throw new Error('Account not found. Use your registered email.')
    }

    user.role = 'admin'
    await user.save()

    console.log('Success! Your account now has admin access.')
  } catch (error) {
    console.error('Could not update account:', error.message)
    process.exitCode = 1
  } finally {
    await mongoose.disconnect()
  }
}

makeAdmin()