const jwt = require('jsonwebtoken')
const config = require('config')

module.exports = (req, res, next) => {
  const token = req.header('x-auth-token')

  if (!token) return res.status(401).json({ msg: 'No token, authorization failed' })

  try {
    const decoded = jwt.verify(token, config.get('jwtSecret'))
    req.user = decoded.user
    console.log('req', req.user)
    next()
  } catch (err) {
    console.error('Token not valid')
    res.send(401).json({ msg: 'Token not valid' })
  }
}