const helper = require('./blogshelper')
const supertest = require('supertest')
const mongoose = require('mongoose')
const app = require('../app')
const api = supertest(app)
const bcrypt = require('bcrypt')

const Blog = require('../models/blog')
const User = require('../models/user')

beforeEach(async () => {
    await Blog.deleteMany({})
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash("PasswTesting", 10)
    const initUser = {
        username: "Tatoxx", 
        name: "Jesus", 
        _id: "5a422a851b54a676234d17f7",
        passwordHash
    }

    const initUserObject = new User(initUser)
    await initUserObject.save()
    const user = await User.findById(initUser._id)


    const blogs = helper.blogs
    const blogObjects = blogs.map(blog =>
        new Blog({ ...blog,
            likes: blog.likes || 0,
            user: user._id
            })
    )
    const promisesArray = blogObjects.map(blog => blog.save())
    await Promise.all(promisesArray)

    for(let blog of blogObjects){
        user.blogs = user.blogs.concat(blog._id)
        await user.save()
    }
    
})


test('Blogs are returned as json', async () => {
  await api
        .get('/api/blogs')
        .expect(200)
        .expect('Content-Type', /application\/json/)
})

test("All blogs are returned", async () => {
    const response = await api.get('/api/blogs')
    expect(response.body).toHaveLength(helper.blogs.length)
})


test("ID is the primary key", async () => {
    const response = await api.get('/api/blogs')
    const testblog = response.body[0]
    expect(helper.hasKey(testblog, "id")).toBeDefined()
})


test('Blogs are saved correctly', async () => {
    
    const blogtest =  { 
        _id: "5a422a851b54a6f8k34d17f7", 
        title: "Speaking About", 
        author: "Pepe Pepito", 
        url: "https://reacttest.com/",
        likes: 4, 
        __v: 0 
    }

    const user = {username: "Tatoxx",password: "PasswTesting"}
    const userResponse = await api.post("/api/login").send(user)
    const token = userResponse.body.token

    await api
          .post('/api/blogs')
          .set('Authorization', `bearer ${token}`)
          .send(blogtest)
          .expect(201)
          .expect('Content-Type', /application\/json/)
    
    const finalBlogs = await helper.getBlogs()
    expect(finalBlogs).toHaveLength(helper.blogs.length + 1)

})


test('Blogs with likes missing field equals to 0', async () => {
    
    const blogtest =  { 
        _id: "5a422a851b54a6f8k34d17f7", 
        title: "Speaking About", 
        author: "Pepe Pepito",
        url: "https://reacttest.com/",
        __v: 0
     }

    const user = {username: "Tatoxx",password: "PasswTesting"}
    const userResponse = await api.post("/api/login").send(user)
    const token = userResponse.body.token

    const response = await api.post('/api/blogs').set('Authorization', `bearer ${token}`).send(blogtest)
    const returnedblog = response.body
    
    expect(returnedblog.likes).toBe(0)
})

test('Blogs saved without title or url return error', async () => {
    
    const blogtest =  { 
        _id: "5a422a851b54a6f8k34d17f7", 
        author: "Pepe Pepito", 
        url: "https://reacttest.com/", 
        likes: 4, 
        __v: 0 
    }

    const user = {username: "Tatoxx",password: "PasswTesting"}
    const userResponse = await api.post("/api/login").send(user)
    const token = userResponse.body.token

    await api
          .post('/api/blogs')
          .set('Authorization', `bearer ${token}`)
          .send(blogtest)
          .expect(400)

})


test('Blogs cannot be saved if user was not logged in', async () => {
    

    const blogWithoutUserId =  { 
        _id: "5a422a851b54a6f8k34d17f7", 
        title: "Speaking About", 
        author: "Pepe Pepito",
        url: "https://reacttest.com/",
        likes: 5,
        __v: 0
     }

    await api
          .post('/api/blogs')
          .send(blogWithoutUserId)
          .expect(401)


})


test('Blogs are deleted successfully', async () => {
    const init_blogs = await helper.getBlogs()
    const blogIDToDelete = init_blogs[0].id

    const user = {username: "Tatoxx",password: "PasswTesting"}
    const userResponse = await api.post("/api/login").send(user)
    const token = userResponse.body.token

    await api
          .delete(`/api/blogs/${blogIDToDelete}`)
          .set('Authorization', `bearer ${token}`)
          .expect(204)

    const final_blogs = await helper.getBlogs()
    
    expect(final_blogs).toHaveLength(init_blogs.length - 1)
})

test('Blogs deleted also delete their reference in User', async () => {
    const init_blogs = await helper.getBlogs()
    const blogIDToDelete = init_blogs[0].id

    const user = {username: "Tatoxx",password: "PasswTesting"}
    const userResponse = await api.post("/api/login").send(user)
    const token = userResponse.body.token

    await api
          .delete(`/api/blogs/${blogIDToDelete}`)
          .set('Authorization', `bearer ${token}`)
          .expect(204)

    
    const userObject = await User.findOne({ username: user.username})

    expect(userObject.blogs).toHaveLength(init_blogs.length - 1)
})

test('Likes of a blog are updated successfully', async () => {
    const init_blogs = await helper.getBlogs()
    const blogToUpdate = init_blogs[0]
    const expected_likes = blogToUpdate.likes + 1

    const updatedBlog = {
            ...blogToUpdate,
            likes: expected_likes
    }

    const user = {username: "Tatoxx",password: "PasswTesting"}
    const userResponse = await api.post("/api/login").send(user)
    const token = userResponse.body.token

    const returnedBlog = await api
        .put(`/api/blogs/${updatedBlog.id}`)
        .set('Authorization', `bearer ${token}`)
        .send(updatedBlog)

    
    expect(expected_likes).toBe(returnedBlog.body.likes)
})

test('Other user cannot update foreign blogs', async () => {
    const init_blogs = await helper.getBlogs()
    const blogToUpdate = init_blogs[0]

    const updatedBlog = {
            ...blogToUpdate,
            author: "me",
            url: "https://me.com",
            title: "I'm the best"
    }

    const passwordHash = await bcrypt.hash("ForeignPass", 10)
    const otherUser = {username: "Foreign", name: "Suspicious",passwordHash}
    const otherUserObject = new User(otherUser)
    await otherUserObject.save()


    const otherResponse = await api.post("/api/login").send({username: "Foreign",password: "ForeignPass"})
    const token = otherResponse.body.token

    await api
        .put(`/api/blogs/${updatedBlog.id}`)
        .set('Authorization', `bearer ${token}`)
        .send(updatedBlog)
        .expect(401)

})



test("All blogs of a user are returned", async () => {
    const response = await api.get('/api/users')
    const user = response.body[0]
    expect(user.blogs).toHaveLength(helper.blogs.length)
})

afterAll( () => {
    mongoose.connection.close()
})