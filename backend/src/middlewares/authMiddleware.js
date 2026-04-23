const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
  // 1. Tenta buscar o token no cabeçalho 'authorization'
  const authHeader = req.headers['authorization'];
  
  // O formato esperado é "Bearer <TOKEN>", por isso fazemos o split
  const token = authHeader && authHeader.split(' ')[1];

  // Se não houver token, barramos a entrada aqui mesmo
  if (!token) {
    return res.status(403).json({ erro: 'Acesso negado. Token não fornecido.' });
  }

  try {
    // 2. Verifica se o token é válido usando o segredo do seu .env
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. O "Pulo do Gato": salvamos o ID que estava dentro do token no objeto 'req'
    // Isso permite que o Controller saiba exatamente quem é o usuário
    req.usuarioId = decoded.id;
    req.isAdmin = decoded.is_admin;

    // 4. Se chegou aqui, está tudo certo. Chama o 'next()' para ir para o Controller
    next();
  } catch (erro) {
    return res.status(401).json({ erro: 'Token inválido ou expirado.' });
  }
};

const verificarAdmin = (req, res, next) => {
  if (!req.isAdmin) {
    return res.status(403).json({ erro: 'Acesso negado. Apenas administradores podem realizar esta ação.' });
  }
  next();
};

module.exports = { verificarToken, verificarAdmin };