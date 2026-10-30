const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')

function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  }
}

function createToken(user) {
  return jwt.sign(
    { userId: user._id.toString() },
    process.env.JWT_SECRET,
    { expiresIn: '1d', algorithm: 'HS256' }
  )
}

function hasJwtSecret() {
  return (
    typeof process.env.JWT_SECRET === 'string' &&
    process.env.JWT_SECRET.length >= 32
  )
}

async function register(req, res) {
  if (!hasJwtSecret()) {
    return res.status(503).json({
      message: 'Login is not configured on the server yet.',
    })
  }

  const { name, email, password } = req.body || {}

  if (
    typeof name !== 'string' ||
    !name.trim() ||
    name.trim().length > 100
  ) {
    return res.status(400).json({ message: 'Enter your name.' })
  }

  if (
    typeof email !== 'string' ||
    email.trim().length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  ) {
    return res.status(400).json({
      message: 'Enter a valid email address.',
    })
  }

  if (
    typeof password !== 'string' ||
    password.length < 8 ||
    Buffer.byteLength(password, 'utf8') > 72
  ) {
    return res.status(400).json({
      message: 'Use at least 8 characters and no more than 72 bytes for your password.',
    })
  }

  try {
    const normalizedEmail = email.trim().toLowerCase()

    const existing = await User.findOne({ email: normalizedEmail })

    if (existing) {
      return res.status(409).json({
        message: 'An account with this email already exists.',
      })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: 'user',
    })

    return res.status(201).json({
      token: createToken(user),
      user: publicUser(user),
    })
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: 'An account with this email already exists.',
      })
    }

    return res.status(500).json({
      message: 'Unable to create your account. Please try again.',
    })
  }
}

async function login(req, res) {
  if (!hasJwtSecret()) {
    return res.status(503).json({
      message: 'Login is not configured on the server yet.',
    })
  }

  const { email, password } = req.body || {}

  if (
    typeof email !== 'string' ||
    typeof password !== 'string' ||
    !email.trim() ||
    !password ||
    email.trim().length > 254 ||
    Buffer.byteLength(password, 'utf8') > 72
  ) {
    return res.status(400).json({
      message: 'Enter a valid email and password.',
    })
  }

  try {
    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    }).select('+password')

    const passwordMatches =
      user && await bcrypt.compare(password, user.password)

    if (!passwordMatches) {
      return res.status(401).json({
        message: 'Incorrect email or password.',
      })
    }

    return res.json({
      token: createToken(user),
      user: publicUser(user),
    })
  } catch {
    return res.status(500).json({
      message: 'Unable to log in. Please try again.',
    })
  }
}

module.exports = { register, login }