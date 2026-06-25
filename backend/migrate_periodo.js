const pool = require('./src/config/db');
pool.query("ALTER TABLE habitos ADD COLUMN IF NOT EXISTS periodo VARCHAR(20) DEFAULT 'Qualquer'")
  .then(() => {
    console.log('Migration successful');
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
