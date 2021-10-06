
const router = require('express').Router()
const authController = require('../controllers/authController')

router.post('/signup', authController.signup)
router.get('/', (req, res) => res.send({ message: 'welcome' }))

module.exports = router
