const express = require('express');
const router = express.Router();
const { register, login, logout, forgetPassword, resetPassword } = require('../Controller/AuthController');

router.post('/register', register);

router.post('/login', login);

router.post('/logout', logout);
router.post('/forget-password', forgetPassword);
router.patch('/reset-password/:token', resetPassword);

module.exports = router;

