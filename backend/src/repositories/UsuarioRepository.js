const pool = require('../config/db');

class UsuarioRepository {
  async findByEmail(email) {
    const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    return result.rows[0];
  }

  async findById(id) {
    const result = await pool.query('SELECT id, nome, email, xp_acumulado, aprovado, is_admin FROM usuarios WHERE id = $1', [id]);
    return result.rows[0];
  }

  async create(nome, email, senhaHash) {
    const result = await pool.query(
      'INSERT INTO usuarios (nome, email, senha_hash, aprovado) VALUES ($1, $2, $3, FALSE) RETURNING id, nome, email, aprovado',
      [nome, email, senhaHash]
    );
    return result.rows[0];
  }

  async listarPendentes() {
    const result = await pool.query('SELECT id, nome, email, criado_em FROM usuarios WHERE aprovado = FALSE ORDER BY criado_em DESC');
    return result.rows;
  }

  async aprovarUsuario(id) {
    const result = await pool.query('UPDATE usuarios SET aprovado = TRUE WHERE id = $1 RETURNING id, nome, email, aprovado', [id]);
    return result.rows[0];
  }

  async reprovarUsuario(id) {
    const result = await pool.query('DELETE FROM usuarios WHERE id = $1 AND aprovado = FALSE', [id]);
    return result.rowCount > 0;
  }

  async adicionarXP(usuarioId, qtd) {
    return await pool.query(
      'UPDATE usuarios SET xp_acumulado = xp_acumulado + $1 WHERE id = $2',
      [qtd, usuarioId]
    );
  }
}

module.exports = new UsuarioRepository();