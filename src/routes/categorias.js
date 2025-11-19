import express from 'express';
import { verificarSesion } from '../middlewares/sesion.js';
import { soloAdmin, soloInstructor,soloAdminOInstructor } from '../middlewares/roles.js';
import {
  listarCategorias,
  crearCategoria,
  asignarCategoriaACurso
} from '../controllers/categoriaController.js';

const router = express.Router();

// Listar categorías (público)
router.get('/', listarCategorias);

// Crear categoría (solo admin)
router.post('/', verificarSesion, soloAdminOInstructor, crearCategoria);

// Asignar categoría a curso (solo admin)
router.post('/asignar', verificarSesion, soloAdminOInstructor, asignarCategoriaACurso);

export default router;
