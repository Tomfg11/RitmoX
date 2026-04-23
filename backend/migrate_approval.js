const pool = require('./src/config/db');

async function migrate() {
  try {
    console.log('Iniciando migração...');
    
    // Adiciona coluna aprovado se não existir
    await pool.query(`
      ALTER TABLE usuarios 
      ADD COLUMN IF NOT EXISTS aprovado BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE
    `);
    
    console.log('Migração concluída com sucesso!');
    process.exit(0);
  } catch (err) {
    console.error('Erro na migração:', err);
    process.exit(1);
  }
}

migrate();
