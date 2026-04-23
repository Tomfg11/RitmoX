const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/AdminController');
const { verificarToken, verificarAdmin } = require('../middlewares/authMiddleware');

router.use(verificarToken);
router.use(verificarAdmin);

router.get('/pendentes', AdminController.listarPendentes);
router.post('/aprovar/:id', AdminController.aprovarUsuario);
router.delete('/reprovar/:id', AdminController.reprovarUsuario);

module.exports = router;
