const pool = require('./src/config/db');

async function testConnection() {
  try {
    console.log('Tentando conectar ao banco de dados...');
    const res = await pool.query('SELECT NOW()');
    console.log('✅ Conexão bem-sucedida!');
    console.log('Horário do servidor no banco:', res.rows[0].now);
    process.exit(0);
  } catch (err) {
    console.error('❌ Erro ao conectar ao banco de dados:');
    console.error(err.message);
    process.exit(1);
  }
}

testConnection();
