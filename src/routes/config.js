// src/routes/config.js o el archivo correspondiente
const express = require('express');
const router = express.Router();
const dotenv = require('dotenv');
dotenv.config(); // Cargar variables del archivo .env

router.get('/config', (req, res) => {
  res.json({
    googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY
  });
});

module.exports = router;
