const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/create', userController.createUser);
router.post('/savings', userController.addSavings);
router.get('/:userId', userController.getUser);

module.exports = router;
