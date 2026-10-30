const express = require('express')
const multer = require('multer')
const sharp = require('sharp')
const UploadedImage = require('../models/UploadedImage')
const {
  protect,
  requireAdmin,
} = require('../middleware/authMiddleware')

const router = express.Router()

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
    fields: 0,
  },
}).single('image')

// Only administrators can upload photos.
router.post('/', protect, requireAdmin, (req, res) => {
  upload(req, res, async (uploadError) => {
    if (uploadError) {
      return res.status(400).json({
        message: 'Upload one image no larger than 5 MB.',
      })
    }

    if (!req.file) {
      return res.status(400).json({
        message: 'Choose an image to upload.',
      })
    }

    let imageData

    try {
      const processor = sharp(req.file.buffer, {
        limitInputPixels: 25000000,
      })

      const metadata = await processor.metadata()

      if (
        !['jpeg', 'png', 'webp'].includes(metadata.format) ||
        (metadata.pages || 1) > 1
      ) {
        return res.status(400).json({
          message: 'Choose a non-animated JPG, PNG, or WebP image.',
        })
      }

      // Resize and convert the photo before storing it.
      imageData = await processor
        .rotate()
        .resize({
          width: 1600,
          height: 1600,
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({ quality: 80 })
        .toBuffer()

      if (imageData.length > 2 * 1024 * 1024) {
        return res.status(400).json({
          message: 'This image is too large. Choose a smaller photo.',
        })
      }
    } catch {
      return res.status(400).json({
        message: 'Unable to read this image. Try another JPG or PNG.',
      })
    }

    try {
      const image = await UploadedImage.create({
        data: imageData,
        contentType: 'image/webp',
        uploadedBy: req.user._id,
      })

      return res.status(201).json({
        path: `/api/images/${image._id}`,
      })
    } catch {
      return res.status(500).json({
        message: 'Unable to save the image. Please try again.',
      })
    }
  })
})

// Visitors can view uploaded property photos.
router.get('/:id', async (req, res) => {
  if (!/^[a-fA-F0-9]{24}$/.test(req.params.id)) {
    return res.status(400).json({ message: 'Invalid image ID.' })
  }

  try {
    const image = await UploadedImage.findById(req.params.id)

    if (!image) {
      return res.status(404).json({ message: 'Image not found.' })
    }

    res.set({
      'Content-Type': image.contentType,
      'Cache-Control': 'public, max-age=86400',
      'X-Content-Type-Options': 'nosniff',
    })

    return res.send(Buffer.from(image.data))
  } catch {
    return res.status(500).json({
      message: 'Unable to load the image.',
    })
  }
})

module.exports = router