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

// @route GET /posts
// @desc Get all posts 
// @access Private
router.get('/', authMiddleware, async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: 'desc' })
    res.json(posts)
  } catch (err) {
    console.error('Error GET /posts request, ', err.message)
    res.status(500).send('Error GET /posts request')
  }
})

// @route GET /posts/:post_id
// @desc Get post by id
// @access Private
router.get('/:post_id', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.post_id)
    if (!post) return res.status(400).json({ msg: 'No post found' })

    res.json(post)
  } catch (err) {
    console.error('Error GET /posts/:post_id request, ', err.message)
    if (err.kind === 'ObjectId') return res.status(400).json({ msg: 'No post found' })
    res.status(500).send('Error GET /posts/:post_id request')
  }
})

// @route DELETE /posts/:post_id
// @desc Delete a post by id
// @access Private
router.delete('/:post_id', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.post_id)

    if (!post) return res.status(404).json({ msg: 'Post not found' })
    if (req.user.id !== post.user.toString()) return res.status(401).json({ msg: 'Not authorized to delete post' })

    await post.remove()
    res.json({ msg: 'Post removed succesffully' })
  } catch (err) {
    console.error('Error DELETE /posts/:post_id request, ', err.message)
    if (err.kind === 'ObjectId') return res.status(400).json({ msg: 'No post found' })
    res.status(500).send('Error DELETE /posts/_post:id request')
  }
})

// @route PUT /posts/like/:post_id
// @desc Like a post
// @access Private
router.put('/like/:post_id', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.post_id)

    if (post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
      return res.status(400).json({ msg: 'Post already liked' })
    }

    post.likes.unshift({ user: req.user.id })
    await post.save()

    res.json(post.likes)
  } catch (err) {
    console.error('Error PUT /like/:post_id request, ', err.message)
    res.status(500).send('Error PUT /like/_post:id request')
  }
})

// @route PUT /posts/unlike/:post_id
// @desc Unlike a post
// @access Private
router.put('/unlike/:post_id', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.post_id)

    if (post.likes.filter(like => like.user.toString() === req.user.id).length === 0) {
      return res.status(400).json({ msg: 'Post has not yet been liked' })
    }

    const index = post.likes.findIndex(like => like.user.toString() === req.user.id)
    post.likes.splice(index, 1)

    await post.save()

    res.json(post.likes)
  } catch (err) {
    console.error('Error PUT /unlike/:post_id request, ', err.message)
    res.status(500).send('Error PUT /unlike/_post:id request')
  }
})

module.exports = router
