const express = require('express')
const router = express.Router()
const authMiddleware = require('../../middleware/authMiddleware')
const User = require('../../models/User')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const config = require('config')
const { check, validationResult } = require('express-validator')

// @route GET /auth
// @access Public
router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password')
    res.json(user)
  } catch (err) {
    console.error('Error GET /auth request, ', err.message)
    res.status(500).send('Error GET /auth request')
  }
})

// @route POST /auth
// @desc Authenticate user & get token
// @access Public
router.post(
  '/',
  [
    check('email', 'Please use a valid email').isEmail(),
    check('password', 'Password is required').exists()
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })

    const { email, password } = req.body

    try {
      let user = await User.findOne({ email })
      if (!user) return res.status(400).json({ errors: [{ msg: 'Invalid credentials' }] })

      const matched = await bcrypt.compare(password, user.password)
      if (!matched) return res.status(400).json({ errors: [{ msg: 'Invalid credentials' }] })

      const payload = {
        user: { id: user.id }
      }
      jwt.sign(payload, config.get('jwtSecret'), { expiresIn: 360000 }, (err, token) => {
        if (err) console.error('Error signing jwt token', err.message)
        res.json({ token })
      })
    } catch (err) {
      console.error('Error POST /user request, ', err.message)
      res.status(500).send('Error POST /user request')
    }
  }
)

module.exports = router
