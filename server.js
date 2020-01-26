const express = require('express')
const connectToDB = require('./config/db')
// routes
const users = require('./routes/api/users')
const auth = require('./routes/api/auth')
const profile = require('./routes/api/profile')
const posts = require('./routes/api/posts')

const app = express()

// Conect to database
connectToDB()

// Initialize Middleware
app.use(express.json({ extended: false }))

// Port Production (Heroku) or development
const PORT = process.env.PORT || 3001

// Define routes
app.use('/users', users)
app.use('/auth', auth)
app.use('/profile', profile)
app.use('/posts', posts)

// Listen to port
app.listen(PORT, () => console.log(`Server started on port ${PORT}`))
