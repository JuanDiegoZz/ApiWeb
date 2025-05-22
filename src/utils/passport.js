const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const pool = require('../database'); 

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails[0].value;
    const nombre = profile.name.givenName;
    const apellido = profile.name.familyName || '';
    const localidad = 'Desconocida'; // Valor por defecto si es NOT NULL en BD

    // Buscar usuario existente
    const result = await pool.query('SELECT * FROM usuarios WHERE correo = $1', [email]);

    if (result.rows.length > 0) {
      // Usuario ya registrado
      return done(null, result.rows[0]);
    } else {
      // Crear usuario nuevo con datos mínimos
      const nuevoUsuario = await pool.query(`
        INSERT INTO usuarios (nombre, apellido, correo, localidad, verificado, rol, estado, creado_en)
        VALUES ($1, $2, $3, $4, true, 'usuario', 'activo', NOW())
        RETURNING *;
      `, [nombre, apellido, email, localidad]);

      return done(null, nuevoUsuario.rows[0]);
    }
  } catch (err) {
    return done(err, null);
  }
}));

// Serializar usuario para guardar solo el ID en sesión
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserializar para obtener el usuario completo a partir del ID guardado en sesión
passport.deserializeUser(async (id, done) => {
  try {
    const result = await pool.query('SELECT * FROM usuarios WHERE id = $1', [id]);
    done(null, result.rows[0]);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;
