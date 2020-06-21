const jwt = require('jsonwebtoken')

const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')

blogsRouter.get('/', async (request, response, next) => {
  const page = Number(request.query.page) || 1
  const limit = Number(request.query.limit) || 5
  const blogs = await Blog
  .find({})
  .sort({date:-1})
  .limit(limit * 1)
  .skip((page - 1) * limit)
  .populate('user', { username: 1, name: 1 } )
  .exec()

  const count = await Blog.countDocuments();

  response.status(200).json({
    blogs: blogs.map( blog => blog.toJSON() ),
    totalPages: Math.ceil(count / limit),
    page: page
  })
})


blogsRouter.get('/:id', async (request, response) => {
  const blog = await Blog.findById(request.params.id).populate('user', { username: 1, name: 1 } )
  if (blog) {
    response.json(blog.toJSON())
  } else {
    response.status(404).end()
  }
})


blogsRouter.post('/', async (request, response, next) => {
    
    const body = request.body
    const decodedToken = jwt.verify(request.token, process.env.SECRET)  

    if (!(request.token) || !decodedToken.id) {    
      return response.status(401).json({ error: 'token missing or invalid' })  
    }  

    const user = await User.findById(decodedToken.id)

    if (!body.title || !body.url) {
      return response.status(400).json({error: "Title and Url fields are required" })
    }

    if (!user) {
      response.status(401).json({ error: "You must be logged in to save blogs" })
    }

    const blog = new Blog({
        title: body.title,
        author: body.author,
        url: body.url,
        likes: body.likes || 0,
        user: user._id,
        likedby: []
    })

    const savedBlog = await blog.save()
    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()
    
    await savedBlog.populate('user', { username: 1, name: 1 } ).execPopulate()
    response.status(201).json(savedBlog.toJSON())  
})


blogsRouter.put('/:id', async (request, response, next) => {
  const body = request.body
  const decodedToken = jwt.verify(request.token, process.env.SECRET)  
  const blog = await Blog.findById(request.params.id)

  if (!(request.token) || !decodedToken.id) {    
    return response.status(401).json({ error: 'token missing or invalid' })  
  }

  if (!blog) { return response.status(404).json( { error: 'blog has not been found' } ) } 
  
  const updatedBlog = {
    ...blog._doc,
    title: body.title, 
    author: body.author,
    url: body.url,
    likes: body.likes || 0,
    likedby: body.likedby
  }

  const updatedBlogObject = await Blog
          .findByIdAndUpdate(request.params.id, updatedBlog, { new: true })
          .populate('user', { username: 1, name: 1 } )
  
  response.json(updatedBlogObject.toJSON())


})



blogsRouter.delete('/:id', async (request, response, next) => {

  const decodedToken = jwt.verify(request.token, process.env.SECRET)  
  const blog = await Blog.findById(request.params.id)

  if (!blog) {
    return response.status(204).end() 
  }

  if (!(request.token) || !decodedToken.id) {    
    return response.status(401).json({ error: 'token missing or invalid' })  
  }

  const user = await User.findById(decodedToken.id)
 
  if (blog.user.toString() === decodedToken.id.toString()) {

    await Blog.findByIdAndRemove(request.params.id)
    user.blogs = user.blogs.filter( blogid => blogid.toString() !== request.params.id.toString() )
    await user.save()
    response.status(204).end()

  } else {
    response.status(401).json( { error: "You cannot delete other's people notes" } )
  }
})

blogsRouter.post('/:id/comments' , async (request, response, next) => {    
  const comment = request.body.newComment
  const blog = await Blog.findById(request.params.id)

  blog.comments = [...blog.comments, comment]
  await blog.save()
  response.status(200).json(comment)
})


module.exports = blogsRouter