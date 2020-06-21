const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')
const crypto = require('crypto')

const usersRouter = require('express').Router()
const config = require('../utils/config')
const User = require('../models/user')
const Token = require('../models/token')
const Blog = require('../models/blog')


usersRouter.get('/', async (request, response, next) => {
  const users = await User
  .find({}).populate('blogs')

  response.status(200).json(users.map(u => u.toJSON()))
})

usersRouter.get('/:id', async (request, response, next) => {
  const user = await User.findById(request.params.id).populate('blogs')
  if (user) {
    response.json(user.toJSON())
  } else {
    response.status(404).end()
  }
})

usersRouter.post('/', async (request, response, next) => {
  const host = request.headers.host
  const body = request.body
  const uEmail = body.email

  if (!(body.password) || body.password.length === 0) {
      return response.status(400)
              .json({error: "Password field is required"})
  } else if (body.password.length < 3) {
      return response.status(400)
              .json({error: "Password should have more than 3 characters"})
  }
    else {
    
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(body.password, saltRounds)
 
    const user = new User({
      username: body.username,
      name: body.name,
      email: body.email,
      passwordHash   
    })
    const savedUser = await user.save()

    const token = new Token({ 
      _userId: savedUser._id, 
      token: crypto.randomBytes(16).toString('hex') 
    })
    const savedToken = await token.save()


    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true, 
      auth: { 
        user: config.EMAIL_USER, 
        pass: config.EMAIL_PASS 
      },
      tls: {
        rejectUnauthorized: false
    },
    })

    const mailOptions = { 
      from: `"Blog-list-app" <${config.EMAIL_USER}>`, 
      to: uEmail, 
      subject: 'Blog-list-app Account Verification', 
      text: 'Hello,\n\n' + 'Please verify your account in blog-list-app by clicking the link: \nhttp:\/\/' + host + '\/confirmation\/' + savedToken.token + '.\n' + 'If you never used or registered in this page, just ignore this email.\n'  
    }
    
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error.message);
      } else {
        console.log('email sent successfully');
      }
  })
    console.log('New user created')
    response.status(201).json({...savedUser.toJSON(), email: uEmail})
  }

})



usersRouter.post('/confirmation', async (request, response, next) => {
  const body = request.body
  const databaseToken = await Token.findOne({ token: body.token })
  
  if (!databaseToken) {
    return response.status(400).json({ 
        error: 'We were unable to find a valid token. Your token may have expired.' 
      })
  }

  const user = await User.findOne({ _id: databaseToken._userId})

  if (!user) return response.status(400).json({ error: 'We were unable to find a user for this token.' })
  if (user.isVerified) return response.status(400).json({ error: 'This user has already been verified.' })
  

  user.isVerified = true
  const updatedUser = await user.save()

  await Token.deleteOne({token: body.token})

  response.status(200).json(updatedUser)
})


usersRouter.post('/resend', async (request, response, next) => {
  const host = request.headers.host
  const body = request.body
  const uEmail = body.email

  const user = await User.findOne({ email: body.email })
  if (!user) return response.status(404).json({ error: 'We were unable to find a user with that email.' })
  if (user.isVerified)  {
    return response.status(400).json({ error: 'This account has already been verified. Please log in.' })
  }

  // Create a verification token, save it, and send email
  // If token still persist, update it. Otherwise create a new token
  const token = new Token({ _userId: user._id, token: crypto.randomBytes(16).toString('hex') })

  const oldToken = await Token.findOne({ _userId: user._id })
  if (oldToken) { await Token.findByIdAndRemove(oldToken._id) }

  // Save the token
  const savedToken = await token.save()

  // Send the email
  const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true, 
      auth: { 
        user: config.EMAIL_USER, 
        pass: config.EMAIL_PASS 
      },
      tls: {
        rejectUnauthorized: false
    },
  })

  const mailOptions = { 
    from: `"Blog-list-app" <${config.EMAIL_USER}>`, 
    to: uEmail, 
    subject: 'Blog-list-app Account Verification', 
    text: 'Hello,\n\n' + 'It seems you forgot to validate your blog-list-app account. You can verify it by clicking the link: \nhttp:\/\/' + host + '\/confirmation\/' + savedToken.token + '.\n' + 'If you never used or registered in this page, just ignore this email.\n' 
  }
  
  transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error.message);
      } else {
        console.log('email sent successfully');
      }
  })

  response.status(200).json({uEmail})
})




usersRouter.post('/reset-password', async (request, response, next) => {
  const host = request.headers.host
  const body = request.body
  const uEmail = body.email

  if (!uEmail || uEmail.length === 0) {
    return response.status(400).json({ error:"Email field is needed"})
  }

  const user = await User.findOne({ email: uEmail}) 
  if (!user) {
    return response.status(404).json({ error: "Email not found"})
  }

  const secret = user.passwordHash + "-" + user.createdAt
  const token = jwt.sign( { userId: user._id.toString() } , secret, {expiresIn: 3600 } )

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    requireTLS: true, 
    auth: { 
      user: config.EMAIL_USER, 
      pass: config.EMAIL_PASS 
    },
    tls: {
      rejectUnauthorized: false
    },
  })

  const mailOptions = { 
    from: `"Blog-list-app" <${config.EMAIL_USER}>`, 
    to: uEmail, 
    subject: 'Blog-list-app Password reset', 
    text: 'Hello,\n\n' + 'It seems you forgot your blog-list-app password. You can set a new one by clicking the link: \nhttp:\/\/' + host + '\/new-password\/' + user._id + '\/' + token + '.\n' + 'If you never used or registered in this page, just ignore this email.\n' 
  }

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error.message);
    } else {
      console.log('email sent successfully');
    }
  })

  response.status(200).json({uEmail})

})




usersRouter.post('/new-password/:userid/:token', async (request, response, next) => {
  const body = request.body
  const password = body.newPassword

  const token = request.params.token
  const userid = request.params.userid

  const user = await User.findById(userid)

  if (!user) {
    response.status(404).json({error: 'User not found with that ID'})
  }

  const secret = user.passwordHash + "-" + user.createdAt
  const payload = jwt.verify(token, secret)
  
  console.log({payload})
  
  if (payload.userId && payload.userId === user._id.toString()) { 
    console.log('llega aqui')
    const saltRounds = 10
    const newPasswordHash = await bcrypt.hash(password, saltRounds)

    const updatedUser = {
      ...user._doc,
      passwordHash: newPasswordHash
    }

    const savedUser = await User.findByIdAndUpdate(userid, updatedUser, { new: true })

    return response.status(202).json({username: savedUser.username})
  } else {
    return response.status(400).json( { error: 'User not found or token expired. Remember you have 60 minutes to reset password' } )
  }
  
})





module.exports = usersRouter