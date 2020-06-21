require('dotenv').config()

let PORT = process.env.PORT || 3001
let MONGODB_URI = process.env.MONGODB_URI
let EMAIL_USER= process.env.EMAIL_USER
let EMAIL_PASS= process.env.EMAIL_PASS

if (process.env.NODE_ENV === 'test') {  
  MONGODB_URI = process.env.TEST_MONGODB_URI
}

module.exports = {
  MONGODB_URI,
  PORT,
  EMAIL_USER,
  EMAIL_PASS
}