const pool = require('../database'); // Importa pool centralizado

/**
 * Inserta un reporte con título y descripción.
 * @param {number} usuario_id
 * @param {string} titulo
 * @param {string} descripcion
 * @param {string} categoria
 * @param {string} direccion
 * @param {number} latitud
 * @param {number} longitud
 * @param {string|null} imagenBase64
 * @returns {Promise<Object>} reporte insertado
 */
const crearReporteEnDB = async (
  usuario_id,
  titulo,
  descripcion,
  categoria,
  direccion,
  latitud,
  longitud,
  imagenBase64
) => {
  try {
    const query = `
      INSERT INTO reportes
        (usuario_id, titulo, descripcion, categoria, direccion,
        latitud, longitud, imagen, estado, enviado_en, actualizado_en)
      VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8, 'pendiente', NOW(), NOW())
      RETURNING *;
    `;

    const values = [
      usuario_id,
      titulo,
      descripcion,
      categoria,
      direccion,
      latitud,
      longitud,
      imagenBase64
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error("Error al insertar reporte en DB:", error);
    throw error;
  }
};

const obtenerReportesPorUsuarioEnDB = async (usuario_id) => {
  const query = `
    SELECT id, titulo, categoria, direccion, estado, enviado_en
    FROM reportes
    WHERE usuario_id = $1
    ORDER BY enviado_en DESC;
  `;
  const { rows } = await pool.query(query, [usuario_id]);
  return rows;
};

/**
 * Obtiene un reporte por su ID.
 * @param {number} id
 * @returns {Promise<Object|null>}
 */
const obtenerReportePorIdEnDB = async (id) => {
  const query = `
    SELECT id, usuario_id, titulo, descripcion, categoria,
    direccion, latitud, longitud, imagen, estado, enviado_en, actualizado_en
    FROM reportes
    WHERE id = $1
    LIMIT 1;
  `;
  const { rows } = await pool.query(query, [id]);

  if (rows.length === 0) return null;

  const reporte = rows[0];

  reporte.latitud = parseFloat(reporte.latitud);
  reporte.longitud = parseFloat(reporte.longitud);

  return reporte;
};

module.exports = { crearReporteEnDB, obtenerReportesPorUsuarioEnDB, obtenerReportePorIdEnDB };
