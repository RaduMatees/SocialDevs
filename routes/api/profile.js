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

module.exports = router
