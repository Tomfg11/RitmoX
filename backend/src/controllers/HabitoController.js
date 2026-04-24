const HabitoRepository = require('../repositories/HabitoRepository');
const pool = require('../config/db'); // Para o update de XP

class HabitoController {
    async listar(req, res) {
        try {
        const habitos = await HabitoRepository.findAllByUser(req.usuarioId);
        res.json(habitos);
        } catch (e) {
        res.status(500).json({ erro: 'Erro ao listar hábitos' });
        }
    }

    async criar(req, res) {
        try {
        const { titulo, frequencia, xp_recompensa, dias_semana } = req.body;
        const habito = await HabitoRepository.create(req.usuarioId, titulo, frequencia || 'personalizado', xp_recompensa, dias_semana);
        res.status(201).json(habito);
        } catch (e) {
        res.status(500).json({ erro: 'Erro ao criar hábito' });
        }
    }

    async checkin(req, res) {
        try {
        const habito = await HabitoRepository.findByIdAndUser(req.params.id, req.usuarioId);
        if (!habito) return res.status(404).json({ erro: 'Hábito não encontrado' });

        await HabitoRepository.realizarCheckin(req.params.id, req.body.notas_de_reflexao);
        
        const xp = habito.xp_recompensa || 10;
        const userUpdate = await pool.query(
            'UPDATE usuarios SET xp_acumulado = xp_acumulado + $1 WHERE id = $2 RETURNING xp_acumulado',
            [xp, req.usuarioId]
        );

        res.status(201).json({ mensagem: 'Check-in realizado!', xp_total: userUpdate.rows[0].xp_acumulado });
        } catch (e) {
        if (e.code === '23505') return res.status(400).json({ erro: 'Check-in já realizado hoje' });
        res.status(500).json({ erro: 'Erro no check-in' });
        }
    }

    async dashboard(req, res) {
        try {
        const data = await HabitoRepository.getDashboardData(req.usuarioId);
        res.json(data);
        } catch (e) {
        res.status(500).json({ erro: 'Erro ao carregar dashboard' });
        }
    }

    async editar(req, res) {
        try {
            const { id } = req.params;
            const usuarioId = req.usuarioId;
            
            const habitoAtual = await HabitoRepository.findByIdAndUser(id, usuarioId);
            if (!habitoAtual) return res.status(404).json({ erro: 'Hábito não encontrado' });

            const dadosUpdate = {
                titulo: req.body.titulo || habitoAtual.titulo,
                frequencia: req.body.frequencia || habitoAtual.frequencia,
                xp_recompensa: req.body.xp_recompensa || habitoAtual.xp_recompensa,
                dias_semana: req.body.dias_semana !== undefined ? req.body.dias_semana : habitoAtual.dias_semana
            };

            const habito = await HabitoRepository.update(id, usuarioId, dadosUpdate);
            res.json(habito);
        } catch (e) {
            res.status(500).json({ erro: 'Erro ao editar hábito' });
        }
    }

    async excluir(req, res) {
        try {
            const { id } = req.params;
            const usuarioId = req.usuarioId;

            const habitoExcluido = await HabitoRepository.delete(id, usuarioId);

            if (!habitoExcluido) {
            return res.status(404).json({ erro: 'Hábito não encontrado ou você não tem permissão.' });
            }

            res.json({ mensagem: 'Hábito removido com sucesso!', habito: habitoExcluido });
        } catch (e) {
            res.status(500).json({ erro: 'Erro ao excluir o hábito.' });
        }
    }
}

module.exports = new HabitoController();