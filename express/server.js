'use strict'
require('dotenv').config()
const express = require('express')
const serverless = require('serverless-http')
const app = express()
const bodyParser = require('body-parser')

const MongoClient = require('mongodb').MongoClient
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${
  process.env.DB_HOST
}/test?retryWrites=true`

const client = new MongoClient(uri, { useNewUrlParser: true })
console.log(`Connecting to ${uri}`)
client.connect(err => {
  console.log('Connected')
  const collection = client.db('test').collection('devices')
  // perform actions on the collection object
  console.log(collection)
  client.close()
})

const router = express.Router()
router.get('/', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' })
  res.write('<h1>Sup, Express running here!</h1>')
  res.end()
})

// get ip address for project name
router.get('/get-ip', (req, res) => res.json({ route: req.originalUrl }))

router.get('/all-ips', (req, res) => res.json({ route: req.originalUrl }))

// post ip address for project name
router.post('/post-ip', (req, res) => {
  console.log('route accessed')
  // save ip address to data store
  const { ip, port, name } = req.body
  const time = Date.now()

  return res.json({
    response: `${name} mapped to ip address ${ip} on port ${port} at ${time}.`
  })
})

app.use(bodyParser.json())
app.use('/.netlify/functions/server', router) // path must route to lambda

module.exports = app
module.exports.handler = serverless(app)
