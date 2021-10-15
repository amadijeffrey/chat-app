const User = require('../models/user')
const jwt = require('jsonwebtoken')
const { promisify } = require('util')
const sendEmail = require('../utils/email')
const crypto = require('crypto')

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN })
}

const signup = async (req, res) => {
  const { username, password } = req.body
  const userObject = { username, password }

  if (!username || !password) return res.status(400).json('Please provide email and password')
  const user = await User.create(userObject)
  const token = signToken(user._id)

  res.status(201).json({ user, token })
}

const login = async (req, res) => {
  const { username, password } = req.body

  // check if user exist
  if (!username || !password) return res.status(400).json('Please provide email and password')
  const foundUser = await User.findOne({ username }).select('+password')

  // check if password is correct
  if (!foundUser || !await foundUser.correctPassword(password, foundUser.password)) {
    return res.status(401).json({ message: 'Incorrect username or password' })
  }
  const token = signToken(foundUser._id)
  res.status(201).json({ token })
  console.log(req.user+)
}

const protect = async (req, res, next) => {
  try {
    // check if token exist
    let token
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1]
    }

    if (!token) return res.status(401).json({ message: 'You are not logged in. Login to get access' })

    // check if token is valid
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)

    // check if user exist
    const foundUser = await User.findById(decoded.id)
    if (!foundUser) return res.status(401).json({ message: 'User with this token does not exist. Please log in again' })

    // check if user password has been changed
    if (foundUser.changedPasswordAfter()) return res.status(401).json({ message: 'User recenly change password. Please login again' })

    // grant access to user
    req.user = foundUser
    next()
  } catch (err) {
    res.status(500).json({ message: 'Something went wrong' })
  }
}

const getUsers = async (req, res) => {
  const allUsers = await User.find()

  if (!allUsers) return res.status(404).json({ message: 'No user found' })
  res.status(201).json({ allUsers })
}

const restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles['lead-guide', 'admin'] role='user'
    if (!roles.includes(req.user.role)) return res.status(403).json({ message: 'You do not have the permission' })
    next()
  }
}

const forgotPassword = async (req, res) => {
  // check if user exist
  const user = await User.findOne({ email: req.body.email })
  if (!user) return res.status(404).json({ message: 'User with that email doesnt exist.' })

  // generate a random token
  const resetToken = user.createPasswordResetToken()
  await user.save({ validateBeforeSave: false })

  const resetUrl = `${req.protocol}://${req.get('host')}/user/resetPassword/${resetToken}`

  const message = `Forgot your password? Send a patch request with your new password to the url 
  included in this mail:${resetUrl}. \n If you didnt forget your password, please ignore this mail if `

  // send token to email
  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token(valid for 10 mins)',
      message
    })

    res.status(200).json({
      status: 'success',
      message: 'Token sent succesfully'
    })
  } catch (err) {
    user.passwordResetToken = undefined
    user.passwordResetTokenExpires = undefined
    res.status(500).json({ message: err })
  }
}

const resetPassword = async (req, res) => {
  // get user based on token
  const hashedToken = crypto.hash('sha256').update(req.params.token).digest('hex')

  const user = await User.findOne({ passwordResetToken: hashedToken, passwordResetExpires: { gt: Date.now() } })

  // if user exist and token has not expired,set new password
  if (!user) return res.status(400).json({ message: 'invalid token or token has expired' })
  user.password = req.body.password
  user.passwordResetToken = undefined
  user.passwordResetTokenExpires = undefined
  await user.save()

  // login user, send JWT
  const token = signToken(user._id)
  res.status(201).json({ token })
}

module.exports = { signup, login, protect, getUsers, restrictTo, forgotPassword, resetPassword }
