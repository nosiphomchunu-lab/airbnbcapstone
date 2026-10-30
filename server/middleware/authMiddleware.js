const jwt = require('jsonwebtoken')
const User = require('../models/User')

async function protect(req, res, next) {
  const authorization = req.headers.authorization || ''

  if (!authorization.startsWith('Bearer ')) {
    return res.status(401).json({
      message: 'Please log in to continue.',
    })
  }

  const token = authorization.slice(7).trim()

  let decoded

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS256'],
    })
  } catch {
    return res.status(401).json({
      message: 'Your session has expired. Please log in again.',
    })
  }

  if (
    typeof decoded.userId !== 'string' ||
    !/^[a-fA-F0-9]{24}$/.test(decoded.userId)
  ) {
    return res.status(401).json({
      message: 'Invalid session. Please log in again.',
    })
  }

  try {
    const user = await User.findById(decoded.userId)

    if (!user) {
      return res.status(401).json({
        message: 'Account not found. Please log in again.',
      })
    }

    req.user = user
    return next()
  } catch {
    return res.status(500).json({
      message: 'Unable to check your account. Please try again.',
    })
  }
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      message: 'Only administrators can access this feature.',
    })
  }

  return next()
}

module.exports = { protect, requireAdmin }