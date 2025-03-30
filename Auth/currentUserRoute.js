const express = require('express');
const router = express.Router();
const authenticateUser = require('./authenticateUser');

// Route to get the current user
router.get('/current-user', authenticateUser, (req, res) => {
    res.status(200).json(req.user); // Send the user data as the response
});

module.exports = router;
