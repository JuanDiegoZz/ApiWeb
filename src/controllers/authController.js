// src/controllers/authController.js

const pool                 = require('../database');
const bcrypt               = require('bcryptjs');
const { validationResult } = require('express-validator');
const jwt                  = require('jsonwebtoken');
const { enviarCorreo }     = require('../utils/mailer');

const FRONTEND_URL = process.env.FRONTEND_URL; // e.g. http://localhost:4000
const JWT_SECRET   = process.env.JWT_SECRET;   // debe estar en tu .env

/**
 * Registro de usuario + correo de bienvenida
 */
async function register(req, res) {
  const { nombre, apellido, localidad, telefono, correo, contraseña } = req.body;

  try {
    // 1) Validar campos
    if (!nombre || !apellido || !localidad || !correo || !contraseña) {
      return res.status(400).json({ mensaje: 'Todos los campos son obligatorios.' });
    }

    // 2) Verificar si el correo ya existe
    const { rows: users } = await pool.query(
      'SELECT id FROM usuarios WHERE correo = $1',
      [correo]
    );
    if (users.length > 0) {
      return res.status(400).json({ mensaje: 'Ese correo ya está registrado.' });
    }

    // 3) Hashear la contraseña
    const salt     = await bcrypt.genSalt(10);
    const hashPass = await bcrypt.hash(contraseña, salt);

    // 4) Insertar usuario
    const { rows } = await pool.query(
      `INSERT INTO usuarios
        (nombre, apellido, localidad, telefono, correo, contraseña)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING id, nombre, correo`,
      [nombre, apellido, localidad, telefono, correo, hashPass]
    );
    const usuario = rows[0];

    // 5) Enviar correo de bienvenida
    const asunto = '¡Bienvenido a Sistema de Reportes Ciudadanos!';
    const html = `
      <h2>Hola ${usuario.nombre} 👋</h2>
      <p>Gracias por registrarte en nuestro sistema de reportes ciudadanos.</p>
      <p>Ahora puedes iniciar sesión y empezar a enviar reportes.</p>
      <hr/>
      <p>Un saludo,<br>El equipo del Sistema de Reportes Ciudadanos</p>
    `;
    await enviarCorreo(usuario.correo, asunto, html);

    // 6) Responder al cliente
    return res.status(201).json({
      mensaje: 'Registro exitoso. Te hemos enviado un correo de bienvenida.'
    });

  } catch (error) {
    console.error('Error en register:', error);
    return res.status(500).json({ mensaje: 'Error interno del servidor.' });
  }
}

/**
 * Login de usuario con JWT
 */
async function login(req, res) {
  const { correo, contraseña } = req.body;
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(400).json({ errors: errores.array() });
  }

  try {
    // 1) Buscar usuario
    const { rows } = await pool.query(
      'SELECT * FROM usuarios WHERE correo = $1',
      [correo]
    );
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }
    const usuario = rows[0];

    // 2) Verificar contraseña
    const passwordValida = await bcrypt.compare(contraseña, usuario.contraseña);
    if (!passwordValida) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }

    // 3) Generar token
    const token = jwt.sign(
      { id: usuario.id, correo: usuario.correo },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    // 4) Responder
    return res.json({
      success: true,
      mensaje: 'Login exitoso',
      usuario: { id: usuario.id, nombre: usuario.nombre, correo: usuario.correo },
      token
    });

  } catch (error) {
    console.error('Error en login:', error);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
}

/**
 * POST /auth/forgot-password
 * Envía correo con enlace de restablecimiento
 */
async function forgotPassword(req, res) {
  const { correo } = req.body;
  try {
    // 1) Verificar que el correo exista
    const { rows } = await pool.query(
      'SELECT id, nombre FROM usuarios WHERE correo = $1',
      [correo]
    );
    if (rows.length === 0) {
      return res.status(404).json({ mensaje: 'Correo no registrado.' });
    }
    const usuario = rows[0];

    // 2) Generar token de recuperación
    const token = jwt.sign(
      { id: usuario.id },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    // 3) Guardar token en BD (opcional)
    await pool.query(
      'UPDATE usuarios SET token_verificacion = $1 WHERE id = $2',
      [token, usuario.id]
    );

    // 4) Construir enlace de recuperación (ahora apunta a reset-password.html)
    const resetLink = `${FRONTEND_URL}/pages/reset-password.html?token=${token}`;

    // 5) Enviar correo
    const asunto = 'Recupera tu contraseña';
    const html = `
      <h2>Hola ${usuario.nombre},</h2>
      <p>Hemos recibido una solicitud para restablecer tu contraseña.</p>
      <p>Haz clic en el siguiente enlace (válido 15 minutos):</p>
      <a href="${resetLink}">${resetLink}</a>
      <hr/>
      <p>Si no solicitaste esto, ignora este correo.</p>
    `;
    await enviarCorreo(correo, asunto, html);

    return res.json({ mensaje: 'Correo enviado con instrucciones para restablecer tu contraseña.' });

  } catch (error) {
    console.error('Error en forgotPassword:', error);
    return res.status(500).json({ mensaje: 'Error interno del servidor.' });
  }
}

/**
 * POST /auth/reset-password
 * Valida token y cambia la contraseña
 */
async function resetPassword(req, res) {
  const { token, nuevaContrasena } = req.body;
  try {
    // 1) Verificar y decodificar token
    const payload = jwt.verify(token, JWT_SECRET);

    // 2) Hashear la nueva contraseña
    const salt      = await bcrypt.genSalt(10);
    const newHashed = await bcrypt.hash(nuevaContrasena, salt);

    // 3) Actualizar usuario y limpiar token
    await pool.query(
      `UPDATE usuarios
         SET contraseña = $1,
             token_verificacion = NULL
       WHERE id = $2`,
      [newHashed, payload.id]
    );

    return res.json({ mensaje: 'Contraseña restablecida correctamente.' });

  } catch (error) {
    console.error('Error en resetPassword:', error);
    return res.status(400).json({ mensaje: 'Token inválido o expirado.' });
  }
}

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword
};
