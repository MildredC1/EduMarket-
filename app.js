import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { fileURLToPath } from 'url';
import path from 'path';
import pool from './config/db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT;
const HOST = process.env.DB_HOST; // o process.env.HOST si lo defines

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.APP_SECRET));

// Logger básico
app.use((req, res, next) => {
  console.log(`Logger - Solicitud recibida: ${req.method} ${req.url}`);
  next();
});

// Ruta para mostrar usuarios desde MySQL
app.get('/usuarios', async (req, res) => {
  try {
    const [usuarios] = await pool.promise().query('SELECT * FROM usuarios');
    res.json(usuarios);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

// Ruta 404 en formato JSON
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
