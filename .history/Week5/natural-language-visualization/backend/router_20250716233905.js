const express = require('express');
const router = express.Router();
const nlpController = require('../controllers/nlpController');

router.post('/analyze', nlpController.processQuery);

module.exports = router;