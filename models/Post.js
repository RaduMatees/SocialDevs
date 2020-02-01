const mongoose = require('mongoose')

const PostSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  },
  text: {
    type: String,
    required: true
  },
  name: { type: String }, // we use this because if a user deletes his account we should keep their posts nevertheless 
  avatar: { type: String }, // we use this because if a user deletes his account we should keep their posts nevertheless
  likes: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'user' }
    }
  ],
  comments: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
      text: { type: String, required: true },
      name: { type: String },
      avatar: { type: String },
      date: { type: Date, default: Date.now }
    }
  ],
  date: { type: Date, default: Date.now }
})

module.exports = Post = mongoose.model('post', PostSchema)
