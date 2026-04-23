const express = require('express');
const router = express.Router();
const HumorController = require('../controllers/HumorController');
const { verificarToken } = require('../middlewares/authMiddleware');

router.use(verificarToken);

router.post('/', HumorController.registrar);
router.get('/hoje', HumorController.getHoje);

module.exports = router;
