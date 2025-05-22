// src/routes/reportesRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const { crearReporte, obtenerReportesPorUsuario, obtenerReportePorId } = require('../controllers/reportesController');

// Configurar multer para recibir la imagen en memoria
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Ruta para crear un nuevo reporte (con posible imagen)
router.post('/', upload.single('imagen'), crearReporte);

// Ruta para obtener un reporte por su ID (debe ir antes de la ruta que usa query)
router.get('/:id', obtenerReportePorId);

// Ruta para obtener reportes por usuario con query param
router.get('/', obtenerReportesPorUsuario);

module.exports = router;
