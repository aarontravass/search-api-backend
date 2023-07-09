import express from 'express'
import { customsearch } from '@googleapis/customsearch'
import { config } from 'dotenv'
import isHtml from 'is-html'
import rateLimit from 'express-rate-limit'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'

// This is the default response error class
class ErrorModel {
  code: string
  message: string
}

// this is the default response class
class ResponseModel {
  success: boolean
  statusCode: number
  error: ErrorModel
  message: string
  data: any
}
// set up dotenv config to read from .env files
config()
// set google's custom search to use v1
const search = customsearch('v1')

// initialize the express app
const app = express()
// use compression middleware to compress the response
app.use(compression())
// set up cross origin config since the host for frontend and backend are different
const CORS_CONFIG = cors({
  origin: ['http://localhost:4200', 'https://search-frontend-sttjypqnpa-uc.a.run.app'],
  methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'X-XSRF-Token', 'Content-Type', 'Accept', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
})
app.use(cookieParser())
// use the defined cors config
app.use(CORS_CONFIG)
app.options('*', CORS_CONFIG)
// use helmet.js to set up content security policy
app.use(helmet())
// the search api
app.post('/search', async (req, res) => {
  // define the response and error models
  const response = new ResponseModel()
  const error = new ErrorModel()
  response.success = false
  // check the query
  if (!req.query.query) {
    response.statusCode = 400
    error.code = 'REQ_101'
    error.message = 'Query is required'
    response.error = error
    return res.status(response.statusCode).json(response)
  }
  // check if query has html to prevent xss attacks
  if (typeof req.query.query !== 'string' || isHtml(req.query.query)) {
    response.statusCode = 400
    error.code = 'REQ_102'
    error.message = 'Query must be a string and not html code'
    response.error = error
    return res.status(response.statusCode).json(response)
  }
  if (req.query.query.length > 100) {
    response.statusCode = 400
    error.code = 'REQ_103'
    error.message = 'Query length must be less than 100 characters'
    response.error = error
    return res.status(response.statusCode).json(response)
  }
  if (req.query.start) {
    if (typeof req.query.start != 'string' || isNaN(parseInt(req.query.start))) {
      response.statusCode = 400
      error.code = 'REQ_104'
      error.message = 'start should be a number string'
      response.error = error
      return res.status(response.statusCode).json(response)
    }
    if (parseInt(req.query.start) <= 0 || parseInt(req.query.start) >= 100) {
      response.statusCode = 400
      error.code = 'REQ_105'
      error.message = 'start should be between 1 and 99'
      response.error = error
      return res.status(response.statusCode).json(response)
    }
  }
  // query the search api
  const result = await search.cse.list({
    auth: process.env.API_KEY,
    q: req.query.query?.toString(),
    cx: process.env.SEARCH_ENGINE_ID,
    start: req.query.start ? parseInt(req.query.start.toString()) : undefined
  })
  response.statusCode = 200
  response.success = true
  response.data = result.data
  // return the resulsts
  return res.status(response.statusCode).json(response)
})

// Apply the rate limiting middleware to all requests
app.use(
  rateLimit({
    windowMs: 30 * 60 * 1000, // 15 minutes
    max: 100 // Limit each IP to 100 requests per `window`
  })
)
// listen on `PORT` or default to 3000
app.listen(parseInt(process.env.PORT || '3000'), () => {
  console.log('started listening')
})

export { app }
