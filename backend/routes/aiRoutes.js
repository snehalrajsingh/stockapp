const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

router.post('/explain-chart', aiController.getChartExplanation);
router.post('/chat', aiController.chat);
router.get('/behavior/:userId', aiController.getBehaviorAnalysis);

module.exports = router;
