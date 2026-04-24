const pool = require('../config/db');

class HabitoRepository {
  async findAllByUser(usuarioId) {
    const habitos = await pool.query(
      `SELECT h.*, 
       COUNT(rh.id) as total_checkins,
       EXISTS (
         SELECT 1 FROM registros_habitos 
         WHERE habito_id = h.id AND data_registro::DATE = CURRENT_DATE
       ) as concluido_hoje
       FROM habitos h
       LEFT JOIN registros_habitos rh ON h.id = rh.habito_id
       WHERE h.usuario_id = $1
       GROUP BY h.id`, [usuarioId]
    );

    const streaks = await this.getStreaks(usuarioId);
    return habitos.rows.map(h => ({
      ...h,
      streak: streaks[h.id] || 0
    }));
  }

  async create(usuarioId, titulo, frequencia, xp, diasSemana = null) {
    const result = await pool.query(
      'INSERT INTO habitos (usuario_id, titulo, frequencia, xp_recompensa, dias_semana) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [usuarioId, titulo, frequencia, xp, diasSemana]
    );
    return result.rows[0];
  }

  async findByIdAndUser(habitoId, usuarioId) {
    const result = await pool.query(
      'SELECT * FROM habitos WHERE id = $1 AND usuario_id = $2',
      [habitoId, usuarioId]
    );
    return result.rows[0];
  }

  async realizarCheckin(habitoId, notas) {
    return await pool.query(
      'INSERT INTO registros_habitos (habito_id, notas_de_reflexao) VALUES ($1, $2)',
      [habitoId, notas]
    );
  }

  async getDashboardData(usuarioId) {
    const usuario = await pool.query('SELECT nome, xp_acumulado FROM usuarios WHERE id = $1', [usuarioId]);
    
    const habitos = await pool.query(
      `SELECT h.*, 
       COUNT(rh.id) as total_checkins,
       EXISTS (
         SELECT 1 FROM registros_habitos 
         WHERE habito_id = h.id AND data_registro::DATE = CURRENT_DATE
       ) as concluido_hoje
       FROM habitos h
       LEFT JOIN registros_habitos rh ON h.id = rh.habito_id
       WHERE h.usuario_id = $1 
       AND (
         h.dias_semana IS NULL 
         OR h.dias_semana = '' 
         OR EXTRACT(DOW FROM CURRENT_DATE)::TEXT = ANY(string_to_array(h.dias_semana, ','))
       )
       GROUP BY h.id`, [usuarioId]
    );

    const heatmap = await pool.query(
      `SELECT data_registro, COUNT(*) as qtd_concluidos
       FROM registros_habitos rh
       JOIN habitos h ON rh.habito_id = h.id
       WHERE h.usuario_id = $1 AND data_registro > CURRENT_DATE - INTERVAL '30 days'
       GROUP BY data_registro ORDER BY data_registro DESC`, [usuarioId]
    );

    // Adicionando streaks aos hábitos no dashboard
    const streaks = await this.getStreaks(usuarioId);
    const habitosComStreaks = habitos.rows.map(h => ({
      ...h,
      streak: streaks[h.id] || 0
    }));

    const tarefas = await pool.query(
      'SELECT * FROM tarefas WHERE usuario_id = $1 AND concluida = false AND "data" >= CURRENT_DATE ORDER BY "data" ASC LIMIT 5',
      [usuarioId]
    );

    return { 
      perfil: usuario.rows[0], 
      habitos: habitosComStreaks, 
      heatmap: heatmap.rows,
      tarefas: tarefas.rows
    };
  }

  async update(id, usuarioId, dados) {
    const { titulo, frequencia, xp_recompensa, dias_semana } = dados;
    const result = await pool.query(
      'UPDATE habitos SET titulo = $1, frequencia = $2, xp_recompensa = $3, dias_semana = $4 WHERE id = $5 AND usuario_id = $6 RETURNING *',
      [titulo, frequencia, xp_recompensa, dias_semana, id, usuarioId]
    );
    return result.rows[0];
  }

  async delete(id, usuarioId) {
    const result = await pool.query(
      'DELETE FROM habitos WHERE id = $1 AND usuario_id = $2 RETURNING *',
      [id, usuarioId]
    );
    return result.rows[0];
  }

  async getStreaks(usuarioId) {
    const habitos = await pool.query('SELECT id, dias_semana FROM habitos WHERE usuario_id = $1', [usuarioId]);
    if (habitos.rows.length === 0) return {};

    const ids = habitos.rows.map(h => h.id);
    const registros = await pool.query(
      `SELECT habito_id, data_registro::DATE as data 
       FROM registros_habitos 
       WHERE habito_id = ANY($1) 
       ORDER BY data_registro DESC`, [ids]
    );

    const streaks = {};
    const registrosPorHabito = {};
    
    // Agrupa registros por hábito
    registros.rows.forEach(reg => {
      if (!registrosPorHabito[reg.habito_id]) {
        registrosPorHabito[reg.habito_id] = [];
      }
      
      const d = new Date(reg.data);
      // Extrair YYYY-MM-DD usando métodos locais para evitar problemas de fuso
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dataStr = `${year}-${month}-${day}`;
      
      if (!registrosPorHabito[reg.habito_id].includes(dataStr)) {
        registrosPorHabito[reg.habito_id].push(dataStr);
      }
    });

    habitos.rows.forEach(h => {
      const habitoRegistros = registrosPorHabito[h.id] || [];
      
      const regTimestamps = habitoRegistros.map(dateStr => {
        const [year, month, day] = dateStr.split('-');
        const d = new Date(year, month - 1, day);
        d.setHours(0, 0, 0, 0);
        return d.getTime();
      });

      let count = 0;
      let checkDate = new Date();
      checkDate.setHours(0, 0, 0, 0);
      
      const diasSemanaArr = h.dias_semana ? h.dias_semana.split(',').map(Number) : [0, 1, 2, 3, 4, 5, 6];
      let todayTimestamp = checkDate.getTime();
      
      const oldestCheckinTimestamp = regTimestamps.length > 0 ? Math.min(...regTimestamps) : todayTimestamp;
      
      while (checkDate.getTime() >= oldestCheckinTimestamp) {
        let isCompleted = regTimestamps.includes(checkDate.getTime());
        let isScheduled = diasSemanaArr.includes(checkDate.getDay());
        let isToday = checkDate.getTime() === todayTimestamp;
        
        if (isCompleted) {
          count++;
        } else {
          if (isScheduled && !isToday) {
            break; // Missed a scheduled day in the past -> Streak breaks
          }
        }
        
        checkDate.setDate(checkDate.getDate() - 1);
        checkDate.setHours(0, 0, 0, 0);
      }
      
      streaks[h.id] = count;
    });

    return streaks;
  }

  async getHeatmapData(usuarioId) {
    const result = await pool.query(
      `SELECT data_registro::DATE as data, COUNT(*) as qtd
      FROM registros_habitos rh
      JOIN habitos h ON rh.habito_id = h.id
      WHERE h.usuario_id = $1
      GROUP BY data_registro::DATE
      ORDER BY data_registro::DATE ASC`,
      [usuarioId]
    );
    return result.rows;
  }
}

module.exports = new HabitoRepository();