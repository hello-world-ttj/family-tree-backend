const express = require('express');
const router = express.Router();
const { signup, login, getUser, getAllUsers } = require('./user.controller');
const auth = require('../../middlewares/auth');

// Public routes
router.post('/signup', signup);
router.post('/login', login);

// Private routes
router.get('/profile', auth, getUser);
router.get('/', auth, getAllUsers);

module.exports = router;