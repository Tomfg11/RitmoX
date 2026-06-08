require('dotenv').config();
const app = require('./src/app');
const cronService = require('./src/services/CronService');

cronService.start();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`RitmoX API rodando na porta ${PORT} 🚀`);
});