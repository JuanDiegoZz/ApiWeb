require('dotenv').config();

const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const path = require('path');
const passport = require('passport');
const cors = require('cors');

const app = express();
const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY;

app.use(cors({
  origin: ['http://localhost:4000', ], // Cambia al puerto o dominio de tu frontend
  credentials: true,
}));

app.get('/config', (req, res) => {
  res.json({ googleMapsApiKey });
});

require('./utils/passport');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(session({
  secret: process.env.SESSION_SECRET || 'mi_secreto',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, // 1 día
    sameSite: 'lax',             // para evitar problemas CORS con cookies
    // secure: false,            // deja false si no usas HTTPS, si usas HTTPS pon true
  }
}));

app.use(passport.initialize());
app.use(passport.session());

// Si quieres servir frontend desde aquí, descomenta la línea:
// app.use(express.static(path.join(__dirname, '../')));

const authRoutes = require('./routes/authRoutes');
const usuariosRoutes = require('./routes/usuariosRoutes');
const reportesRoutes = require('./routes/reportesRoutes');
const estadisticasRoutes = require('./routes/estadisticasRoutes'); //Para las tablas de Charts


app.use('/reportes', reportesRoutes);
app.use('/usuarios', usuariosRoutes);
app.use('/auth', authRoutes);
app.use('/estadisticas', estadisticasRoutes);//Para las tablas de Charts

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
