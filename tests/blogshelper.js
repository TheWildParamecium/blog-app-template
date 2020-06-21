const Blog = require('../models/blog')
const User = require('../models/user')

const blogs = [  
        { _id: "5a422aa71b54a676234d17f8", title: "Go To Statement Considered Harmful", author: "Edsger W. Dijkstra", url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html", likes: 5, __v: 0 },
        { _id: "5a422b3a1b54a676234d17f9", title: "Canonical string reduction", author: "Edsger W. Dijkstra", url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html", likes: 12, __v: 0 },
        { _id: "5a422b891b54a676234d17fa", title: "First class tests", author: "Robert C. Martin", url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll", likes: 10, __v: 0 }, 
        { _id: "5a422ba71b54a676234d17fb", title: "TDD harms architecture", author: "Robert C. Martin", url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html", likes: 0, __v: 0 }, 
        { _id: "5a422bc61b54a676234d17fc", title: "Type wars", author: "Robert C. Martin", url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html", likes: 2, __v: 0 }
]   

const users = [
    { name: "Tester1", username: "Testy1", password: "passw1", _id: "5a422bc61b54a676234d25fa"},
    { name: "Tester2", username: "Testy2", password: "passw2", _id: "5a422bc61b54a676234d25fb"},
    { name: "Tester3", username: "Testy3", password: "passw3", _id: "5a422bc61b54a676234d25ft"},
    { name: "Tester4", username: "Testy4", password: "passw4", _id: "5a422bc61b54a676234d25fd"},
    { name: "Tester5", username: "Testy5", password: "passw5", _id: "5a422bc61b54a676234d25fe"},
]

const getBlogs = async () => {
    const blogs = await Blog.find({})
    return blogs.map(blog => blog.toJSON())
}

const getUsers = async () => {
    const users = await User.find({})
    return users.map(user => user.toJSON())
}

const hasKey = (object, key) =>{
    if (object[key] === undefined) {
        return undefined
    } 
    return true
}

module.exports = {blogs, users, getBlogs, getUsers, hasKey}