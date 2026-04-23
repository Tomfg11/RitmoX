const express = require('express');
const router = express.Router();
const HabitoController = require('../controllers/HabitoController');
const { verificarToken } = require('../middlewares/authMiddleware');

router.use(verificarToken); // Protege todas as rotas abaixo

router.get('/', HabitoController.listar);
router.post('/', HabitoController.criar);
router.post('/:id/checkin', HabitoController.checkin);
router.put('/:id', HabitoController.editar);
router.get('/dashboard', HabitoController.dashboard);
router.delete('/:id', HabitoController.excluir);
// Rota para salvar a reflexão/resumo de um hábito específico
router.post('/:id/resumo', async (req, res) => {
  try {
    const { id } = req.params;
    const { conteudo } = req.body;
    const usuarioId = req.usuarioId; // Pego pelo middleware de auth

    const novoResumo = await pool.query(
      'INSERT INTO resumos_semanais (habito_id, usuario_id, conteudo) VALUES ($1, $2, $3) RETURNING *',
      [id, usuarioId, conteudo]
    );

    res.status(201).json(novoResumo.rows[0]);
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao salvar resumo' });
  }
});

module.exports = router;