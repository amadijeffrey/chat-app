
const router = require('express').Router()
const authController = require('../controllers/authController')

router.post('/signup', authController.signup)
router.post('/login', authController.login)
router.get('/users', authController.protect, authController.getUsers)
router.post('/user/forgotPassword', authController.forgotPassword)
router.patch('/user/resetPassword/:token', authController.resetPassword)
module.exports = router
