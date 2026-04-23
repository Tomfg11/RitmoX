const pool = require('./src/config/db');

async function makeAdmin(email) {
  try {
    if (!email) {
      console.error('Por favor, forneça um e-mail. Ex: node make_admin.js usuario@email.com');
      process.exit(1);
    }

    console.log(`Tornando o usuário ${email} administrador e aprovando-o...`);
    
    const result = await pool.query(
      'UPDATE usuarios SET is_admin = TRUE, aprovado = TRUE WHERE email = $1 RETURNING id, nome, email',
      [email]
    );

    if (result.rowCount === 0) {
      console.error('Usuário não encontrado.');
    } else {
      console.log('Sucesso! Usuário agora é administrador:', result.rows[0]);
    }
    
    process.exit(0);
  } catch (err) {
    console.error('Erro:', err);
    process.exit(1);
  }
}

const email = process.argv[2];
makeAdmin(email);
