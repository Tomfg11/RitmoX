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
  max: 500, // limite aumentado para 500 requisições por IP (mais adequado para SPAs)
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

// Middleware de tratamento de erros global
app.use((err, req, res, next) => {
  console.error('Erro não tratado:', err);
  res.status(500).json({ 
    erro: 'Ocorreu um erro interno no servidor.',
    detalhes: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

module.exports = app;