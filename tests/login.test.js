const helper = require('./blogshelper')
const supertest = require('supertest')
const mongoose = require('mongoose')
const app = require('../app')
const api = supertest(app)
const bcrypt = require('bcrypt')

const User = require('../models/user')

beforeEach(async () => {
    await User.deleteMany({})

    const userWithPass = helper.users.map(async (user) => {
        const passwordHash = await bcrypt.hash(user.password, 10)
        
        const userObject = new User({
            username: user.username,
            name: user.name,
            passwordHash
        })

        await userObject.save()
    })

    await Promise.all(userWithPass)
})

test('Registered users can login correctly', async () => {
    const testUser = helper.users[0]
    
    await api
    .post('/api/login')
    .send(testUser)
    .expect(200)
})

test('Unregistered user will not be able to login', async () => {

    const fakeUser = {
        name: "Suspicious Dolphin", 
        username: "Dolphy", 
        password: "mockingyou", 
        _id: "5a422bc61b54a676234d25fa"
    }

    await api
    .post('/api/login')
    .send(fakeUser)
    .expect(401)
})

test('Registered users will obtain a token', async () => {
    const testUser = helper.users[0]
    const response = await api
        .post('/api/login')
        .send(testUser)
        .expect(200)
    
    expect(response.body.hasOwnProperty("token")).toBe(true)
})


afterAll( () => {
    mongoose.connection.close()
})