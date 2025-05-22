const pool = require('../database');  // Importa pool centralizado

/**
 * Recupera un usuario por su ID.
 * @param {number} id
 * @returns {Promise<Object|null>}
 */
async function obtenerUsuarioPorIdEnDB(id) {
  const query = `
    SELECT id, nombre, apellido, localidad, telefono, correo
    FROM usuarios
    WHERE id = $1
    LIMIT 1;
  `;
  const { rows } = await pool.query(query, [id]);
  return rows[0] || null;
}

/**
 * Actualiza los datos de un usuario.
 * @param {number} id
 * @param {Object} datos
 * @param {string} datos.nombre
 * @param {string} datos.apellido
 * @param {string} datos.localidad
 * @param {string} datos.telefono
 * @param {string} datos.correo
 * @returns {Promise<Object>}
 */
async function actualizarUsuarioEnDB(id, { nombre, apellido, localidad, telefono, correo }) {
  const query = `
    UPDATE usuarios
    SET nombre    = $2,
        apellido  = $3,
        localidad = $4,
        telefono  = $5,
        correo    = $6
    WHERE id = $1
    RETURNING id, nombre, apellido, localidad, telefono, correo;
  `;
  const values = [id, nombre, apellido, localidad, telefono, correo];
  const { rows } = await pool.query(query, values);
  return rows[0];
}

module.exports = { obtenerUsuarioPorIdEnDB, actualizarUsuarioEnDB };
