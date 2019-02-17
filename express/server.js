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

const dbClient = new MongoClient(uri, { useNewUrlParser: true })

const router = express.Router()
router.get('/', (req, res) => {
  console.log('yo')
  res.writeHead(200, { 'Content-Type': 'text/html' })
  res.write('<h1>Sup, Express running here!</h1>')
  res.end()
})

// get ip address for project name
router.get('/get-ip', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' })
  res.write('<h1>Sup, IP ADDRESSES!</h1>')
  res.end()
  // res.json({ route: req.originalUrl })
})

router.get('/all-ips', (req, res) => {
  // get al records from db
  dbClient.connect(err => {
    console.log('Connected')
    const collection = dbClient.db('test').collection('devices')
    // perform actions on the collection object
    console.log(collection)
    dbClient.close()
  })

  res.json({ route: req.originalUrl })
})

// post ip address for project name
router.post('/post-ip', (req, res) => {
  console.log('route accessed')
  // save ip address to data store
  const { ip, port, name } = req.body
  const time = Date.now()
  const entry = { _id: name, ip, port }
  var response
  dbClient.connect(err => {
    dbClient
      .db('main')
      .collection('ips')
      .insertOne(entry, (err, res) => {
        if (err) return (response = err)
        response = `${name} mapped to ip address ${ip} on port ${port} at ${time}.`
      })

    dbClient.close()
  })

  return res.send({
    response
  })
})

app.use(bodyParser.json())
app.use('/.netlify/functions/server', router) // path must route to lambda

module.exports = app
module.exports.handler = serverless(app)
