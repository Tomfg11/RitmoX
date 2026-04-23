const pool = require('../config/db');

class HumorRepository {
  async registrar(usuarioId, nivel, notas = '') {
    const result = await pool.query(
      `INSERT INTO humor_diario (usuario_id, nivel, notas) 
       VALUES ($1, $2, $3) 
       ON CONFLICT (usuario_id, data) 
       DO UPDATE SET nivel = $2, notas = $3 
       RETURNING *`,
      [usuarioId, nivel, notas]
    );
    return result.rows[0];
  }

  async getHumorHoje(usuarioId) {
    const result = await pool.query(
      'SELECT * FROM humor_diario WHERE usuario_id = $1 AND data = CURRENT_DATE',
      [usuarioId]
    );
    return result.rows[0];
  }

  async getHistorico(usuarioId, limite = 30) {
    const result = await pool.query(
      'SELECT * FROM humor_diario WHERE usuario_id = $1 ORDER BY data DESC LIMIT $2',
      [usuarioId, limite]
    );
    return result.rows;
  }
}

module.exports = new HumorRepository();
