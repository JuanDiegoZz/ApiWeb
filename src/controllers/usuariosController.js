// src/controllers/usuariosController.js
const {
  obtenerUsuarioPorIdEnDB,
  actualizarUsuarioEnDB
} = require('../models/usuarioModel');

async function obtenerUsuarioPorId(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }
    const usuario = await obtenerUsuarioPorIdEnDB(id);
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json(usuario);
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({ error: 'Error de servidor' });
  }
}

async function actualizarUsuario(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    const { nombre, apellido, localidad, telefono, correo } = req.body;
    // Validaciones básicas
    if (!nombre || !apellido || !correo) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }
    // (Aquí podrías agregar regex para validar correo o teléfono)

    const usuarioActualizado = await actualizarUsuarioEnDB(id, {
      nombre, apellido, localidad, telefono, correo
    });
    res.json(usuarioActualizado);
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ error: 'Error de servidor' });
  }
}

module.exports = { obtenerUsuarioPorId, actualizarUsuario };
