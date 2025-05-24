const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;  // Aquí está la corrección
    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ error: 'Token is not valid' });
  }
};
const verificarRol = (rolRequerido) => {
  return (req, res, next) => {
    if (!req.user || req.user.rol !== rolRequerido) {
      return res.status(403).json({ error: 'Acceso denegado: no tienes los permisos necesarios' });
    }
    next();
  };
};

module.exports ={verificarToken ,verificarRol};
