const HumorRepository = require('../repositories/HumorRepository');
const UsuarioRepository = require('../repositories/UsuarioRepository');

class HumorController {
  async registrar(req, res) {
    try {
      const { nivel, notas } = req.body;
      const usuarioId = req.usuarioId;

      if (!nivel || nivel < 1 || nivel > 5) {
        return res.status(400).json({ erro: 'Nível de humor inválido (deve ser entre 1 e 5)' });
      }

      const jaTinhaRegistro = await HumorRepository.getHumorHoje(usuarioId);
      const humor = await HumorRepository.registrar(usuarioId, nivel, notas);
      
      let xp_total;
      if (!jaTinhaRegistro) {
        // Bônus de XP apenas no primeiro registro do dia
        await UsuarioRepository.adicionarXP(usuarioId, 10);
        const usuario = await UsuarioRepository.findById(usuarioId);
        xp_total = usuario.xp_acumulado;
      } else {
        const usuario = await UsuarioRepository.findById(usuarioId);
        xp_total = usuario.xp_acumulado;
      }

      res.status(201).json({ humor, xp_total, ganhou_xp: !jaTinhaRegistro });
    } catch (erro) {
      res.status(500).json({ erro: 'Erro ao registrar humor' });
    }
  }

  async getHoje(req, res) {
    try {
      const usuarioId = req.usuarioId;
      const humor = await HumorRepository.getHumorHoje(usuarioId);
      res.json(humor || { nivel: 0 });
    } catch (erro) {
      res.status(500).json({ erro: 'Erro ao buscar humor' });
    }
  }
}

module.exports = new HumorController();
