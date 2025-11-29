const express = require('express');
const router = express.Router();
const controller = require('../controllers/flagController');

router.post('/', controller.createFlag);
router.get('/reported/:userId', controller.getFlagsForUser);
router.put('/:id/status', controller.updateFlagStatus);

module.exports = router;
