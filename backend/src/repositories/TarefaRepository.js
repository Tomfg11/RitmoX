const pool = require('../config/db');

class TarefaRepository {
  async create(usuarioId, titulo, data, prioridade = 'normal', descricao = '') {
    const result = await pool.query(
      'INSERT INTO tarefas (usuario_id, titulo, "data", prioridade, descricao) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [usuarioId, titulo, data, prioridade, descricao]
    );
    return result.rows[0];
  }

  async findAllByUser(usuarioId) {
    const result = await pool.query(
      'SELECT * FROM tarefas WHERE usuario_id = $1 ORDER BY "data" ASC, created_at ASC',
      [usuarioId]
    );
    return result.rows;
  }

  async findByWeek(usuarioId, startData, endData) {
    const result = await pool.query(
      'SELECT * FROM tarefas WHERE usuario_id = $1 AND "data" >= $2 AND "data" <= $3 ORDER BY "data" ASC',
      [usuarioId, startData, endData]
    );
    return result.rows;
  }

  async toggleConcluida(id, usuarioId) {
    const result = await pool.query(
      'UPDATE tarefas SET concluida = NOT concluida WHERE id = $1 AND usuario_id = $2 RETURNING *',
      [id, usuarioId]
    );
    return result.rows[0];
  }

  async delete(id, usuarioId) {
    const result = await pool.query(
      'DELETE FROM tarefas WHERE id = $1 AND usuario_id = $2 RETURNING *',
      [id, usuarioId]
    );
    return result.rows[0];
  }
}

module.exports = new TarefaRepository();
