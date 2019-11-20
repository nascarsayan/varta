const MongoClient = require('mongodb').MongoClient;
class Database {

  constructor(uri, dbname) {
    this.uri = uri
    this.dbname = dbname
    this.db = {}
    return this
  }

  async connect() {
    MongoClient.connect(this.uri, { useNewUrlParser: true, useUnifiedTopology: true }, (err, client) => {
      this.db = client.db(this.dbname)
    });

  }

  async addTweets(tweets) {
    await Promise.all(tweets.map(async tweet => {
      const result = await this.db.collection('twstream').findOne({
        'id_str': tweet.id_str
      })
      if (!result) {
        this.db.collection('twstream').insertOne(tweet)
      }
    }))
  }

  async getTweets({ term, since }) {
    let start = since
    console.log(start)
    const tweets = await this.db.collection('twstream').find({
      date: { $gte: start },
      term: { $regex: term, $options: 'i' }
    }).toArray()
    const cached = await this.isCached({ term })
    return { tweets, cached }
  }

  async isCached({ term }) {
    let start = new Date()
    start.setHours(0, 0, 0, 0)
    const tweets = await this.db.collection('twstream').find({
      created_on: { $gte: start },
      term: { $regex: term, $options: 'i' }
    }).toArray()
    return tweets.length > 0
  }
}

module.exports = Database;
