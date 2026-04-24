const pool = require('./src/config/db');

async function setTimezone() {
  try {
    // Definindo no nível do banco de dados (postgres) para que a aplicação e todas sessões peguem
    await pool.query("ALTER DATABASE postgres SET timezone TO 'America/Sao_Paulo'");
    console.log("Timezone alterado com sucesso para America/Sao_Paulo no banco de dados.");
  } catch (error) {
    console.error("Erro ao alterar timezone:", error);
  } finally {
    pool.end();
  }
}

setTimezone();
