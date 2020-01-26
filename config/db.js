const mongoose = require('mongoose')
const config = require('config')
const db = config.get('mongoURI')

const connectToDB = async () => {
  try {
    await mongoose.connect(db, {
      useUnifiedTopology: true,
      useNewUrlParser: true
    })
    console.info('MongoDB is succesfully connected...')
  } catch (err) {
    console.error('Error connecting to MongoDB, ', err.message)
    process.exit(1)
  }
}

module.exports = connectToDB
