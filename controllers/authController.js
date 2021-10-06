const User = require('../models/user')
const jwt = require('jsonwebtoken')

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN })
}

const signup = (req, res) => {
  const { username, password } = req.body
  const userObject = { username, password }

  if (!username || !password) return res.status(400).json('Please provide email and password', 400)
  User.create(userObject, (user) => {
    const token = signToken(user._id)
    res.status(201).json({ user, token })
  })
}

const login = async (req, res) => {
  const { username, password } = req.body

  if (!username || !password) return res.status(400).json('Please provide email and password', 400)
  const foundUser = await User.findOne({ username }).select('+password')

  if (!foundUser || !await foundUser.correctPassword(password, foundUser.password)) {
    return res.status(401).json({ message: 'Incorrect username or password' })
  }
  const token = signToken(foundUser._id)
  res.status(201).json({ token })
}

module.exports = { signup, login }
