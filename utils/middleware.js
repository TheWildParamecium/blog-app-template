const logger = require('./logger')
const jwt = require('jsonwebtoken')

const requestLogger = (request, response, next) => {

  logger.info('---')
  logger.info('Method:', request.method)
  logger.info('Path:  ', request.path)
  logger.info('Body:  ', request.body)
  logger.info('Query: ', request.query)
  if (request.token){
    const decodedToken = jwt.verify(request.token, process.env.SECRET)
    logger.info('Token: ', request.token)
    logger.info('Decoded Token: ', JSON.stringify(decodedToken) )
  } 
  logger.info('---')
  next()
}

const tokenExtractor = (request, response, next) => {
  
  const authorization = request.get('authorization')  
    if (authorization && authorization.toLowerCase().startsWith('bearer ')) {   
        request.token = authorization.substring(7)  
    } else {
        request.token = null
    }

  next()    
}

const unknownEndpoint = (request, response) => {
  response.status(404).json({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
  
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  } else if (error.name === 'ReferenceError') {
    return response.status(400).json({ error: error.message })
  } else if (error.name === 'SyntaxError') {
    return response.status(400).json({ error: error.message })
  } else if (error.name === 'JsonWebTokenError') {    
    return response.status(401).json({ error: 'invalid token'})
  } else if (error.name === 'TypeError') {
    return response.status(400).json({ error: error.message })
  }

  logger.error(error.message)

  next(error)
}

module.exports = {
  requestLogger,
  unknownEndpoint,
  errorHandler,
  tokenExtractor
}