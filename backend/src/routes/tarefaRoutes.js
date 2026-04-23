const express = require('express');
const router = express.Router();
const TarefaController = require('../controllers/TarefaController');
const { verificarToken } = require('../middlewares/authMiddleware');

router.use(verificarToken);

router.post('/', TarefaController.criar);
router.get('/', TarefaController.listar);
router.patch('/:id/alternar', TarefaController.alternar);
router.delete('/:id', TarefaController.excluir);

module.exports = router;
