// src/routes/estadisticasRoutes.js
const express = require('express');
const router = express.Router();
const estadisticasController = require('../controllers/estadisticasController');

// Ruta para la gráfica de pastel (reportes por estado)
router.get('/por-estado', estadisticasController.getPorEstado);

// Ruta para la gráfica de líneas (reportes por fecha y estado)
router.get('/por-fecha', estadisticasController.getPorFecha);

router.get('/por-tipo', estadisticasController.getPorTipo);

module.exports = router;
