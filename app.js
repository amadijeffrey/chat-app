const express = require('express')
const mongoose = require('mongoose')
const dotenv = require('dotenv').config()

const authRoute = require('./routes/authRoute')

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(authRoute)

mongoose.connect(process.env.DBURL,
  {
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  }
).then(() => console.log('DB connected '))
app.get('/', (req, res) => res.json({ mes: 'welcome' }))

app.listen(5050, () => {
  console.log('app is running')
})
