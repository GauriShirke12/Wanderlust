const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync');
const analyticsController = require('../controllers/analytics');

router.get('/', wrapAsync(analyticsController.dashboard));

module.exports = router;
