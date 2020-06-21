const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const userSchema = mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true,
    minlength: 3
  },
  email: { 
    type: String,
    required: true,
    unique: true 
  },
  name: {
    type: String,
  },
  passwordHash: {
    type: String,
  },
  isVerified: { type: Boolean, default: false },
  createdAt: { type: Date,  default: Date.now },
  passwordResetExpires: Date,
  passwordResetToken: String,
  blogs: [    
    {      
      type: mongoose.Schema.Types.ObjectId,      
      ref: 'Blog'    
    }  
  ]
})

userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
    delete returnedObject.passwordHash
    delete returnedObject.email
    delete returnedObject.isVerified
  }
})

userSchema.plugin(uniqueValidator)

const User = mongoose.model('User', userSchema)

module.exports = User