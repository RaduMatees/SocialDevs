const express = require('express')
const router = express.Router()
const { check, validationResult } = require('express-validator')
const authMiddleware = require('../../middleware/authMiddleware')
const Post = require('../../models/Post')
const Profile = require('../../models/Profile')
const User = require('../../models/User')

// @route POST /posts
// @desc Create a post
// @access Private
router.post('/', [authMiddleware, [
  check('text', 'Text is requires').not().isEmpty()
]], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })

  try {
    const user = await User.findById(req.user.id).select('-password')

    const newPost = new Post({
      text: req.body.text,
      name: user.name,
      avatar: user.avatar,
      user: req.user.id
    })
    const post = await newPost.save()

    res.json(post)
  } catch (err) {
    console.error('Error POST /posts request, ', err.message)
    res.status(500).send('Error POST /posts request')
  }
})

module.exports = router
