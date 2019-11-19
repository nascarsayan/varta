const Twitter = require('twitter')
const express = require('express')
const queryString = require('query-string')
require('dotenv').config()
const Database = require('./db')

const app = express()
const port = 3002
let db
const client = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
})

if (process.env.PROXY === 'true') {
  client.request_options = { proxy: 'http://172.16.2.30:8080' }
}

let range = n => Array.from(Array(n).keys())

const query = async (term, max_id = null) => {
  try {
    let qobj = { q: `place:b850c1bfd38f30e0 ${term}`, count: 100, include_entities: 1 }
    if (max_id) {
      qobj = { ...qobj, max_id }
    }
    let tweets = await client.get('search/tweets', qobj)
    tweets.statuses = tweets.statuses.map(status => ({
      ...status,
      term,
      date: new Date(status.created_at),
      created_on: new Date()
    }))
    return tweets
  } catch (err) {
    console.log(err)
    return {}
  }
}

app.get('/', (req, res) => res.send('Hello World!!'))

app.get('/api/query/recent', async (req, res) => {
  const term = req.query.term
  const past = parseInt(req.query.past || '7')
  const iter = Math.min(parseInt(req.query.iter || '7'), 7)
  let tres = []
  try {
    const { tweets, cached } = await db.getTweets({ term, past })
    if (cached) {
      tres = tweets
    } else {
      console.log('Fetching from twitter')
      let max_id = null, ires
      tres = []
      for (let i = 0; i < iter; i++) {
        ires = await query(term, max_id)
        if (Object.keys(ires) === 0) break
        tres = [...tres, ...ires.statuses]
        // console.log(ires.search_metadata)
        max_id = (queryString.parse(ires.search_metadata.next_results)).max_id
        if (!max_id) break
      }
      await db.addTweets(tres)
      console.log(`Fetched ${tres.length} queries of ${term}`)
    }
  } catch (err) {
    console.log(err)
  }
  res.header("Access-Control-Allow-Origin", "*")
  res.send(tres)
})

app.listen(port, async () => {
  try {
    db = new Database(process.env.MONGO_URI || 'mongodb://localhost:27017', process.env.MONGO_DBNAME || 'twitter')
    await db.connect()
  } catch (err) {
    console.log(err)
  }
  console.log(`App running on port ${port}`)
})
