// src/routes/authRoutes.js
const express        = require('express');
const passport       = require('passport');
const router         = express.Router();
const authController = require('../controllers/authController');
const verificarToken = require('../middlewares/authMiddleware'); // Importa el middleware

// Ruta para registrar usuario (pública)
router.post('/registro', authController.register);

// Ruta para login de usuario (pública)
router.post('/login', authController.login);

// Rutas de recuperación de contraseña (públicas)
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password',  authController.resetPassword);

// Ruta protegida: ejemplo de perfil de usuario
router.get('/perfil', verificarToken, (req, res) => {
  // Esta ruta solo será accesible si el usuario tiene un token válido
  res.json({
    mensaje: 'Perfil del usuario',
    usuario: req.user // Aquí se accede a los datos decodificados del usuario
  });
});

// 🟢 Rutas de autenticación con Google

// Iniciar login con Google
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

// Callback luego de autenticación con Google
router.get('/google/callback',
  passport.authenticate('google', {
    failureRedirect: 'http://localhost:4000/pages/login.html',  // Redirigir en caso de fallo
    successRedirect: 'http://localhost:4000/'                   // Redirigir al index o dashboard tras login exitoso
  })
);

// Ruta para obtener datos del usuario actual autenticado (usado en frontend)
router.get('/usuario', (req, res) => {
  if (req.isAuthenticated()) {
    const usuario = req.user;
    res.json({
      autenticado: true,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        // Agrega otros campos necesarios, pero no la contraseña ni otros datos sensibles
      }
    });
  } else {
    res.json({ autenticado: false });
  }
});

// Cerrar sesión
router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: 'Error al cerrar sesión' });
    }
    req.session.destroy(() => {
      res.redirect('/pages/login.html');  // Redirigir después de logout
    });
  });
});

module.exports = router;
