const express = require('express');
const router = express.Router();
const NotificationController = require('../controllers/NotificationController');
const { verificarToken } = require('../middlewares/authMiddleware');

router.post('/subscribe', verificarToken, NotificationController.subscribe);
router.post('/test', verificarToken, NotificationController.testPush);

module.exports = router;
