const UsuarioRepository = require('../repositories/UsuarioRepository');

class AdminController {
  async listarPendentes(req, res) {
    try {
      const pendentes = await UsuarioRepository.listarPendentes();
      res.json(pendentes);
    } catch (erro) {
      res.status(500).json({ erro: 'Erro ao listar usuários pendentes' });
    }
  }

  async aprovarUsuario(req, res) {
    try {
      const { id } = req.params;
      const usuario = await UsuarioRepository.aprovarUsuario(id);
      if (!usuario) {
        return res.status(404).json({ erro: 'Usuário não encontrado' });
      }
      res.json({ mensagem: 'Usuário aprovado com sucesso!', usuario });
    } catch (erro) {
      res.status(500).json({ erro: 'Erro ao aprovar usuário' });
    }
  }

  async reprovarUsuario(req, res) {
    try {
      const { id } = req.params;
      const sucesso = await UsuarioRepository.reprovarUsuario(id);
      if (!sucesso) {
        return res.status(404).json({ erro: 'Usuário não encontrado ou já aprovado' });
      }
      res.json({ mensagem: 'Cadastro reprovado e removido.' });
    } catch (erro) {
      res.status(500).json({ erro: 'Erro ao reprovar usuário' });
    }
  }
}

module.exports = new AdminController();
