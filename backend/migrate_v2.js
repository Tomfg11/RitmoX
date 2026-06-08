require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function migrate() {
  try {
    console.log("Iniciando migração...");
    
    // Add meta_diaria to habitos
    await pool.query(`
      ALTER TABLE habitos 
      ADD COLUMN IF NOT EXISTS meta_diaria INTEGER DEFAULT 1;
    `);
    console.log("Adicionado meta_diaria na tabela habitos.");

    // Add tipo to tarefas
    await pool.query(`
      ALTER TABLE tarefas 
      ADD COLUMN IF NOT EXISTS tipo VARCHAR(50) DEFAULT 'EVENTO';
    `);
    console.log("Adicionado tipo na tabela tarefas.");

    // Add data_limite to tarefas
    await pool.query(`
      ALTER TABLE tarefas 
      ADD COLUMN IF NOT EXISTS data_limite DATE;
    `);
    console.log("Adicionado data_limite na tabela tarefas.");

    console.log("Migração concluída com sucesso!");
  } catch (err) {
    console.error("Erro na migração:", err);
  } finally {
    pool.end();
  }
}

migrate();
