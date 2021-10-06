const express = require('express')
const mongoose = require('mongoose')

const authRoute = require('./routes/authRoute')

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(authRoute)

mongoose.connect(process.env.DB_URL,
  {
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  }
).then(() => console.log('DB connected '))
app.get('/', (req, res) => res.send('welcome'))

app.listen(5050, () => {
  console.log('app is running')
})
