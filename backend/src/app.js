const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const authRoutes = require('./routes/authRoutes');
const habitoRoutes = require('./routes/habitoRoutes');
const tarefaRoutes = require('./routes/tarefaRoutes');
const humorRoutes = require('./routes/humorRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Segurança: Adiciona cabeçalhos HTTP seguros
app.use(helmet());

// Limitação de taxa: Protege contra ataques de força bruta e DoS
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // limite de 100 requisições por IP por janela
  message: { erro: 'Muitas requisições vindas deste IP, tente novamente após 15 minutos.' }
});
app.use(limiter);

app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/habitos', habitoRoutes);
app.use('/tarefas', tarefaRoutes);
app.use('/humor', humorRoutes);
app.use('/admin', adminRoutes);

module.exports = app;