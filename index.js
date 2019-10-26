const Twitter = require('twitter')
const express = require('express')
const cors = require('cors')
require('dotenv').config()

const app = express()
const port = 3002

const client = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
})

if (process.env.PROXY === 'true') {
  client.request_options = { proxy: 'http://172.16.2.30:8080' }
}
app.get('/', (req, res) => res.send('Hello World!!'))

app.get('/api/query/recent', (req, res) => {
  const term = req.param('term')
  client.get('search/tweets', {
    q: `place:b850c1bfd38f30e0 ${term}`,
    count: 1000
  },
    function (error, tweets) {
      res.header("Access-Control-Allow-Origin", "*")
      console.log(tweets.statuses[0].entities.urls);
      res.send(tweets.statuses.map(t => {
        let url = null
        try {
          url = t.entities.urls[0].url
        } catch {
          url = 'https://twitter.com/'
        }
        return {
          place: t.place.name, coord: t.place.bounding_box.coordinates, text: t.text, url
        }
      }));
      // console.log(tweets);
    })
})

app.listen(port, () => console.log(`App running on port ${port}`))
