const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UsuarioRepository = require('../repositories/UsuarioRepository');

class AuthController {
  async registro(req, res) {
    try {
      const { nome, email, senha } = req.body;
      const senhaHash = await bcrypt.hash(senha, 10);
      const usuario = await UsuarioRepository.create(nome, email, senhaHash);
      res.status(201).json({ mensagem: 'Usuário criado com sucesso! Aguarde a aprovação de um administrador para fazer login.', usuario });
    } catch (erro) {
      res.status(500).json({ erro: 'Erro no registro' });
    }
  }

  async login(req, res) {
    try {
      const { email, senha } = req.body;
      const usuario = await UsuarioRepository.findByEmail(email);

      if (!usuario || !(await bcrypt.compare(senha, usuario.senha_hash))) {
        return res.status(401).json({ erro: 'Credenciais inválidas' });
      }

      if (!usuario.aprovado) {
        return res.status(403).json({ erro: 'Seu cadastro está aguardando aprovação do administrador.' });
      }

      const token = jwt.sign({ id: usuario.id, is_admin: usuario.is_admin }, process.env.JWT_SECRET, { expiresIn: '7d' });
      res.json({ token, usuario: { id: usuario.id, nome: usuario.nome, is_admin: usuario.is_admin } });
    } catch (erro) {
      res.status(500).json({ erro: 'Erro no login' });
    }
  }
}

module.exports = new AuthController();