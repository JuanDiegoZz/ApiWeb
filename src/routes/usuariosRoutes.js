// src/routes/usuariosRoutes.js
const express = require('express');
const router = express.Router();

const {
  obtenerUsuarioPorId,
  actualizarUsuario
} = require('../controllers/usuariosController');

// Obtener usuario por ID
router.get('/:id', obtenerUsuarioPorId);

// Actualizar usuario por ID
router.put('/:id', actualizarUsuario);

module.exports = router;
