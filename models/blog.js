const mongoose = require('mongoose')
mongoose.set('useFindAndModify', false);

const blogSchema = mongoose.Schema({
    title: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    author: String,
    likes: Number,
    user: {    
      type: mongoose.Schema.Types.ObjectId,    
      ref: 'User'  
    },
    likedby: [
      {
        type: String
      }
    ],
    comments: [
      {
        type: String
      }
    ],
    date: {
      type: Date,
      default: Date.now
  }
})

blogSchema.set('toJSON', {
    transform: (document, returnedObject) => {
      returnedObject.id = returnedObject._id.toString()
      delete returnedObject._id
      delete returnedObject.__v
    }
})

module.exports = mongoose.model('Blog', blogSchema)
  