const pool = require('./src/config/db');

async function migrate() {
  console.log("Iniciando migração V3 (Push Notifications)...");

  try {
    // 1. Criar tabela de inscrições push
    await pool.query(`
      CREATE TABLE IF NOT EXISTS push_subscriptions (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
        endpoint TEXT NOT NULL,
        p256dh TEXT NOT NULL,
        auth TEXT NOT NULL,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Tabela push_subscriptions criada ou já existente.");

    // 2. Adicionar coluna notificado em tarefas
    try {
      await pool.query(`ALTER TABLE tarefas ADD COLUMN notificado BOOLEAN DEFAULT false;`);
      console.log("Adicionado coluna notificado na tabela tarefas.");
    } catch (err) {
      if (err.code === '42701') { // 42701 is duplicate column error
        console.log("Coluna notificado já existe na tabela tarefas.");
      } else {
        throw err;
      }
    }

    console.log("Migração V3 concluída com sucesso!");
  } catch (error) {
    console.error("Erro na migração:", error);
  } finally {
    await pool.end();
  }
}

migrate();
