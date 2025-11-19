import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { fileURLToPath } from 'url';
import path from 'path';
import pool from './src/config/db.js';

// Importar rutas
import authRoutes from './src/routes/auth.js';
import cursosRoutes from './src/routes/cursos.js';
import adminRoutes from './src/routes/admin.js';
import categoriasRoutes from './src/routes/categorias.js';
import inscripcionesRoutes from './src/routes/inscripciones.js';
import catalogoRoutes from './src/routes/catalogo.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.DB_HOST || 'localhost';

//  Middlewares globales
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.APP_SECRET || 'secreto'));

//  Logger básico
app.use((req, res, next) => {
  console.log(`Logger - Solicitud recibida: ${req.method} ${req.url}`);
  next();
});

//  Rutas principales
app.use('/auth', authRoutes);         // Registro, login, logout
app.use('/cursos', cursosRoutes);     // Listado, creación y edición de cursos
app.use('/admin', adminRoutes);       // Gestión de usuarios y cursos (solo admin)
app.use('/categorias', categoriasRoutes); // Listado y asignación de categorías

app.use('/', inscripcionesRoutes);
app.use('/', catalogoRoutes);
app.use('/', cursosRoutes);

//  Ruta de prueba: listar usuarios directamente desde MySQL
app.get('/usuarios', async (req, res) => {
  try {
    const [usuarios] = await pool.promise().query('SELECT * FROM usuarios');
    res.json(usuarios);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

//  Ruta de prueba: estado del servidor
app.get('/', (req, res) => {
  res.send('API de Cursos_Online funcionando correctamente ');
});

//  Ruta 404 en formato JSON
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

//  Servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://${HOST}:${PORT}`);
});
