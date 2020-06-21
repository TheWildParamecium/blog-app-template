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


test('List of Users is being retrieved correctly as JSON', async () => {
    await api
    .get('/api/users')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('All users all retrieved correctly', async () => {
    const response = await api.get('/api/users')
    expect(response.body).toHaveLength(helper.users.length)
})

test('New user can be added successfully', async () => {
    const initialUsers = await helper.getUsers()
    const user = {
        name: 'Paco',
        username: 'Paquito23',
        password: 'papapaco23'
    }

    await api
        .post('/api/users')
        .send(user)
        .expect(201)
        .expect('Content-Type', /application\/json/)
    
    const finalUsers = await helper.getUsers()
    expect(finalUsers).toHaveLength(initialUsers.length + 1)
})

test('Invalid user is not added to the database', async () => {
    const initialUsers = await helper.getUsers()
    const user = {
        name: 'DamnUser',
        username: '',
        password: 'k8ewfewfwfewf'
    }

    await api
        .post('/api/users')
        .expect(400)
        
    const finalUsers = await helper.getUsers()

    expect(finalUsers).toHaveLength(initialUsers.length)

})


afterAll( () => {
    mongoose.connection.close()
})