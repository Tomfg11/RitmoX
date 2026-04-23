const pool = require('../config/db');

class ResumoRepository {
  async create(usuarioId, habitoId, conteudo) {
    const result = await pool.query(
      `INSERT INTO resumos_semanais (usuario_id, habito_id, conteudo) 
       VALUES ($1, $2, $3) RETURNING *`,
      [usuarioId, habitoId, conteudo]
    );
    return result.rows[0];
  }

  async findByHabito(habitoId, usuarioId) {
    const result = await pool.query(
      'SELECT * FROM resumos_semanais WHERE habito_id = $1 AND usuario_id = $2 ORDER BY data_criacao DESC',
      [habitoId, usuarioId]
    );
    return result.rows;
  }
}

module.exports = new ResumoRepository();