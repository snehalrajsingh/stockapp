const express = require('express');
const router = express.Router();
const tradeController = require('../controllers/tradeController');

router.post('/execute', tradeController.executeTrade);
router.get('/portfolio/:userId', tradeController.getPortfolio);
router.get('/history/:userId', tradeController.getTrades);

module.exports = router;
