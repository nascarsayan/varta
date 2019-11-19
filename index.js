const Twitter = require('twitter')
const express = require('express')
// const cors = require('cors')
// const moment = require('moment')
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
    // console.log(qobj)
    let tweets = await client.get('search/tweets', qobj)
    tweets.statuses = tweets.statuses.map(status => ({
      ...status,
      term,
      date: new Date(status.created_at),
      created_on: new Date()
    }))
    // console.log(tweets.statuses[0])
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
  // console.log(tres.length)
  res.send(tres)
})

// app.get('/api/query/max', async (req, res) => {
//   const term = req.params('term')
//   const query = async (term, start = null, end = null) => {
//     // console.log(`place:b850c1bfd38f30e0 ${term}${(start) ? ` since:${start}` : ''}${(end) ? ` until:${end}` : ''}`);
//     const tweets = await client.get('search/tweets', {
//       q: `place:b850c1bfd38f30e0 ${term}${(start) ? ` since:${start}` : ''}${(end) ? ` until:${end}` : ''}`,
//       count: 100
//     })
//     return tweets.statuses.map(t => {
//       let url = null
//       try {
//         url = t.entities.urls[0].url
//       } catch {
//         url = 'https://twitter.com/'
//       }
//       return {
//         id: t.id, place: t.place.name, coord: t.place.bounding_box.coordinates, text: t.text, url, raw: t
//       }
//     })
//   }
//   let range = n => Array.from(Array(n).keys())
//   let result = [], old = 4
//   let dates = range(old).map(v => ({
//     start: moment().subtract((v + 1) * 7, 'd').format('YYYY-MM-DD'),
//     end: moment().subtract(v * 7, 'd').format('YYYY-MM-DD')
//   }))
//   result = (await Promise.all(dates.map(d => query(term, d.start, d.end)))).reduce((acc, nxt) => [...acc, ...nxt])
//   let ids = new Set()
//   result.map(t => ids.add(t.id))
//   res.header("Access-Control-Allow-Origin", "*")
//   console.log(ids.size)
//   res.send(result)
// })

app.listen(port, async () => {
  try {
    db = new Database(process.env.MONGO_URI || 'mongodb://localhost:27017', process.env.MONGO_DBNAME || 'twitter')
    await db.connect()
  } catch (err) {
    console.log(err)
  }
  console.log(`App running on port ${port}`)
})
