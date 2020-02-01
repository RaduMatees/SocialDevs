const express = require('express')
const router = express.Router()
const authMiddleware = require('../../middleware/authMiddleware')
const Profile = require('../../models/Profile')
const User = require('../../models/User')
const { check, validationResult } = require('express-validator')

// @route GET /profile/me
// @desc Get current user profile
// @access Private
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id }).populate('user', ['name', 'avatar'])

    if (!profile) return res.status(400).json({ msg: 'No profile found for this user' })

    res.json(profile)
  } catch (err) {
    console.error('Error GET /profile/me request, ', err.message)
    res.status(500).send('Error GET /profile/me request')
  }
})

// @route POST /profile
// @desc Create or Update a user profile
// @access Private
router.post('/', [authMiddleware, [
  check('status', 'Status is required').not().isEmpty(),
  check('skills', 'At least one skill is required').not().isEmpty()
]], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })

  const { company, website, location, status, skills, bio, githubusername, youtube, facebook, twitter, instagram, linkedin } = req.body

  // Build profile object
  const profileFields = {}
  profileFields.user = req.user.id
  if (company) profileFields.company = company
  if (website) profileFields.website = website
  if (location) profileFields.location = location
  if (status) profileFields.status = status
  if (bio) profileFields.bio = bio
  if (githubusername) profileFields.githubusername = githubusername
  if (skills) profileFields.skills = skills.split(',').map(skill => skill.trim())

  // Build social object
  profileFields.social = {}
  if (youtube) profileFields.social.youtube = youtube
  if (facebook) profileFields.social.facebook = facebook
  if (twitter) profileFields.social.twitter = twitter
  if (instagram) profileFields.social.instagram = instagram
  if (linkedin) profileFields.social.linkedin = linkedin

  try {
    let profile = await Profile.findOne({ user: req.user.id })

    if (profile) {
      // Update
      profile = await Profile.findOneAndUpdate({ user: req.user.id }, { $set: profileFields }, { new: true })
      return res.json(profile)
    }

    // Create
    profile = new Profile(profileFields)
    await profile.save()
    res.json(profile)
  } catch (err) {
    console.error('Error POST /profile request, ', err.message)
    res.status(500).send('Error POST /profile request')
  }
})

// @route GET /profile
// @desc Get all profiles
// @access Public
router.get('/', async (req, res) => {
  try {
    const profiles = await Profile.find().populate('user', ['name', 'avatar'])
    res.json(profiles)
  } catch (err) {
    console.error('Error GET /profile request, ', err.message)
    res.status(500).send('Error GET /profile request')
  }
})

// @route GET /profile/user/:user_id
// @desc GET profile by user id
// @access Public
router.get('/user/:user_id', async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.params.user_id }).populate('user', ['name', 'avatar'])

    if (!profile) return res.status(400).json({ msg: 'No profile found for this user' })
    res.json(profile)
  } catch (err) {
    console.error('Error GET /profile/user/:user_id request, ', err.message)
    if (err.kind === 'ObjectId') return res.status(400).json({ msg: 'No profile found for this user' })
    res.status(500).send('Error GET /profile/user/:user_id  request')
  }
})

// @route DELETE /profile
// @desc DELETE profile, user & posts
// @access Private
router.delete('/', authMiddleware, async (req, res) => {
  try {
    await Profile.findOneAndRemove({ user: req.user.id })
    await User.findByIdAndRemove({ _id: req.user.id })

    res.json({ msg: 'Succesfully deleted user' })
  } catch (err) {
    console.error('Error GET /profile/user/:user_id request, ', err.message)
    if (err.kind === 'ObjectId') return res.status(400).json({ msg: 'No profile found for this user' })
    res.status(500).send('Error GET /profile/user/:user_id  request')
  }
})

// @route PUT /profile/experience
// @desc Add profile experience
// @access Private
router.put('/experience', [authMiddleware, [
  check('title', 'Job title is required').not().isEmpty(),
  check('company', 'Company name is required').not().isEmpty(),
  check('from', 'From date is required').not().isEmpty()
]], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })

  const { title, company, location, from, to, current, description } = req.body
  const newExp = { title, company, location, from, to, current, description }

  try {
    const profile = await Profile.findOne({ user: req.user.id })
    profile.experience.unshift(newExp)
    await profile.save()

    res.json(profile)
  } catch (err) {
    console.error('Error PUT /profile/experience, ', err.message)
    res.status(500).send('Error PUT /profile/experience  request')
  }
})

// @route PUT /profile/experience/:experience_id
// @desc Update profile experience
// @access Private
router.put('/experience/:experience_id', [authMiddleware, [
  check('title', 'Job title is required').not().isEmpty(),
  check('company', 'Company name is required').not().isEmpty(),
  check('from', 'From date is required').not().isEmpty()
]], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })

  const { title, company, location, from, to, current, description } = req.body

  try {
    const profile = await Profile.findOne({ user: req.user.id })
    const selectedExperience = profile.experience.find(exp => exp.id === req.params.experience_id)

    if (title) selectedExperience.title = title
    if (company) selectedExperience.company = company
    if (location) selectedExperience.location = location
    if (from) selectedExperience.from = from
    if (to) selectedExperience.to = to
    if (current) selectedExperience.current = current
    if (description) selectedExperience.description = description

    await profile.save()
    res.json(profile)
  } catch (err) {
    console.error('Error PUT /profile/experience/:experience_id, ', err.message)
    res.status(500).send('Error PUT /profile/experience/:experience_id  request')
  }
})

// @route DELETE /profile/experience/:experience_id
// @desc Delete experience from profile
// @access Private
router.delete('/experience/:experience_id', authMiddleware, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id })

    const index = profile.experience.findIndex(exp => exp.id === req.params.experience_id)
    profile.experience.splice(index, 1)

    await profile.save()
    res.json(profile)
  } catch (err) {
    console.error('Error DELETE /profile/experience/:experience_id, ', err.message)
    res.status(500).send('Error DELETE /profile/experience/:experience_id  request')
  }
})

module.exports = router
