// src/controllers/reportesController.js
const {
  crearReporteEnDB,
  obtenerReportesPorUsuarioEnDB,
  obtenerReportePorIdEnDB
} = require('../models/reporteModel');

// Crea un nuevo reporte
const crearReporte = async (req, res) => {
  try {
    const {
      latitud,
      longitud,
      direccion,
      titulo,
      descripcion,
      categoria,
      usuario_id
    } = req.body;

    // Validar campos obligatorios
    if (
      !latitud     || !longitud   || !direccion ||
      !titulo      || !descripcion|| !categoria ||
      !usuario_id
    ) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    // Validar tipos
    if (isNaN(latitud) || isNaN(longitud) || isNaN(usuario_id)) {
      return res.status(400).json({ error: 'Latitud, longitud y usuario_id deben ser números válidos' });
    }

    // Procesar imagen (opcional)
    let imagenUrl = null;
    if (req.file) {
      imagenUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    }

    // Convertir a números
    const usuarioId = parseInt(usuario_id, 10);
    const latNum     = parseFloat(latitud);
    const lngNum     = parseFloat(longitud);

    // Insertar en BD
    const nuevoReporte = await crearReporteEnDB(
      usuarioId,
      titulo,
      descripcion,
      categoria,
      direccion,
      latNum,
      lngNum,
      imagenUrl
    );

    return res.status(201).json({
      message: "Reporte creado correctamente",
      reporte: nuevoReporte
    });

  } catch (error) {
    console.error("Error al crear el reporte:", error);
    return res.status(500).json({
      error: "Error al crear el reporte",
      message: error.message
    });
  }
};

// Obtiene los reportes de un usuario
const obtenerReportesPorUsuario = async (req, res) => {
  try {
    const usuarioId = parseInt(req.query.usuario_id, 10);
    if (isNaN(usuarioId)) {
      return res.status(400).json({ error: 'usuario_id inválido' });
    }

    const reportes = await obtenerReportesPorUsuarioEnDB(usuarioId);
    return res.json(reportes);

  } catch (error) {
    console.error("Error al obtener reportes:", error);
    return res.status(500).json({ error: 'Error al obtener reportes' });
  }
};

// Obtiene un reporte por su ID
const obtenerReportePorId = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    const reporte = await obtenerReportePorIdEnDB(id);
    if (!reporte) {
      return res.status(404).json({ error: 'Reporte no encontrado' });
    }

    return res.json(reporte);
  } catch (error) {
    console.error("Error al obtener el reporte:", error);
    return res.status(500).json({ error: 'Error al obtener el reporte' });
  }
};

module.exports = {crearReporte,obtenerReportesPorUsuario, obtenerReportePorId};
