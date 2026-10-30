const dns = require('node:dns')
dns.setServers(['8.8.8.8', '8.8.4.4'])
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const path = require('path')
const propertyRoutes = require('./routes/propertyRoutes')
const reservationRoutes = require('./routes/reservationRoutes')
const authRoutes = require('./routes/authRoutes')
const adminRoutes = require('./routes/adminRoutes')
const imageRoutes = require('./routes/imageRoutes')

require('dotenv').config({ path: path.join(__dirname, '.env') })

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
}))
app.use(express.json())
app.use('/api/properties', propertyRoutes)
app.use('/api/reservations', reservationRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/images', imageRoutes)

app.get('/api/health', (req, res) => {
  res.json({
    message: 'Airbnb backend is running',
    database: mongoose.connection.readyState === 1
      ? 'Connected'
      : 'Disconnected',
  })
})

app.use('/api', (req, res) => {
  res.status(404).json({ message: 'API endpoint not found.' })
})

const clientBuildPath = path.join(__dirname, '../client/dist')

app.use(express.static(clientBuildPath))

app.get(/.*/, (req, res, next) => {
  res.sendFile(path.join(clientBuildPath, 'index.html'), (error) => {
    if (error) next(error)
  })
})

async function startServer() {
  const { MONGO_URI, MONGO_PASSWORD } = process.env

  if (!MONGO_URI || !MONGO_PASSWORD) {
    console.error('Add MONGO_URI and MONGO_PASSWORD to server/.env')
    process.exit(1)
  }

  const connectionString = MONGO_URI.replace(
    '<db_password>',
    encodeURIComponent(MONGO_PASSWORD)
  )

  try {
    await mongoose.connect(connectionString, {
    dbName: 'airbnb_capstone',
    serverSelectionTimeoutMS: 15000,
    family: 4,
    })

    console.log('MongoDB connected successfully')

    app.listen(PORT, () => {
      console.log(`Backend running on http://localhost:${PORT}`)
    })
  } catch (error) {
    console.error('MongoDB connection failed.')
    console.error('Error type:', error.name)
    console.error('Details:', error.message)
    console.error('Cause:', error.cause?.message || 'Not provided')
    console.error('Error code:', error.code || 'Not provided')
    console.error('System call:', error.syscall || 'Not provided')
    console.error('Check your database password and Atlas IP access list.')
    process.exit(1)
  }
}

startServer()