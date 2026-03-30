const express = require('express');
const router = express.Router();
const marketController = require('../controllers/marketController');

router.post('/scenario/start', marketController.startScenario);
router.post('/scenario/next/:userId', marketController.nextStep);
router.get('/scenario/state/:userId', marketController.getCurrentState);
router.get('/news', marketController.getNews);

module.exports = router;
