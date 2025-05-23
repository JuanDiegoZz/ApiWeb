const pool = require('../database');

exports.getPorEstado = async (req, res) => {
  const { fechaInicio, fechaFin } = req.query;


  let query = `
    SELECT estado, COUNT(*) AS cantidad
    FROM reportes
  `;

  const params = [];
  if (fechaInicio && fechaFin) {
    query += ` WHERE enviado_en BETWEEN $1 AND $2 `;
    params.push(fechaInicio, fechaFin);
  }

  query += ` GROUP BY estado`;

  try {
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener estadísticas por estado' });
  }
};

exports.getPorFecha = async (req, res) => {
  const { fechaInicio, fechaFin } = req.query;

  let query = `
    SELECT DATE(enviado_en) AS fecha, estado, COUNT(*) AS cantidad
    FROM reportes
  `;

  const params = [];
  if (fechaInicio && fechaFin) {
    query += ` WHERE enviado_en BETWEEN $1 AND $2 `;
    params.push(fechaInicio, fechaFin);
  }

  query += ` GROUP BY fecha, estado ORDER BY fecha ASC`;

  try {
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener estadísticas por fecha' });
  }
};
exports.getPorTipo = async (req, res) => {
  const { fechaInicio, fechaFin } = req.query;
  let query = `
    SELECT categoria, COUNT(*) AS cantidad
    FROM reportes
  `;
  const params = [];

  if (fechaInicio && fechaFin) {
    query += ` WHERE enviado_en BETWEEN $1 AND $2 `;
    params.push(fechaInicio, fechaFin);
  }

  query += ` GROUP BY categoria ORDER BY cantidad DESC`;

  try {
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener estadísticas por tipo' });
  }
};
